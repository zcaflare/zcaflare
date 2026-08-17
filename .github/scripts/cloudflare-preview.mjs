#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const PREVIEW_ENVIRONMENTS = new Set(['dev', 'development', 'preview', 'stg', 'staging'])
const PRODUCTION_ENVIRONMENTS = new Set(['prd', 'prod'])
const CAPABILITIES = new Set(['d1', 'kv', 'cache', 'r2', 'vectorize'])

export function assertDopplerEnvironment(kind, value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  const allowed = kind === 'production' ? PRODUCTION_ENVIRONMENTS : PREVIEW_ENVIRONMENTS
  if (!allowed.has(normalized))
    throw new Error(`Doppler environment '${normalized || '<empty>'}' is not allowed for ${kind}`)
  return normalized
}

export function previewNames(slug) {
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) || slug.length > 45)
    throw new Error(`Invalid preview slug: ${slug}`)
  return {
    worker: `${slug}-preview`,
  }
}

export function validateCapabilities(resources) {
  const unique = [...new Set(resources)]
  for (const resource of unique) {
    if (!CAPABILITIES.has(resource))
      throw new Error(`Unknown preview resource capability: ${resource}`)
  }
  return unique
}

export function previewResourcesFromSecrets(config, secrets) {
  const resources = validateCapabilities(config.resources)
  const resolved = {}
  const requireValue = (key) => {
    const value = String(secrets[key] ?? '').trim()
    if (!value)
      throw new Error(`Doppler preview config is missing ${key}`)
    return value
  }

  if (resources.includes('d1'))
    resolved.d1 = { uuid: requireValue('CLOUDFLARE_D1_DATABASE_ID') }
  if (resources.includes('kv'))
    resolved.kv = { id: requireValue('CLOUDFLARE_KV_NAMESPACE_ID') }
  if (resources.includes('cache'))
    resolved.cache = { id: requireValue('CLOUDFLARE_CACHE_NAMESPACE_ID') }
  if (resources.includes('r2'))
    resolved.r2 = { name: requireValue('CLOUDFLARE_R2_BUCKET') }
  if (resources.includes('vectorize')) {
    if (!config.vectorize)
      throw new Error('Vectorize capability requires a vectorize contract')
    resolved.vectorize = { name: config.vectorize.name }
  }
  if (resolved.kv && resolved.cache && resolved.kv.id === resolved.cache.id)
    throw new Error('CLOUDFLARE_KV_NAMESPACE_ID and CLOUDFLARE_CACHE_NAMESPACE_ID must be distinct')
  return resolved
}

export function filterRuntimeSecrets(secrets) {
  return Object.fromEntries(Object.entries(secrets).filter(([key]) =>
    key.startsWith('NUXT_') || key === 'CRON_SECRET'))
}

let rawRunner = spawnSync

export function setRunnerForTest(runner) {
  rawRunner = runner ?? spawnSync
}

function run(command, args, options = {}) {
  const result = rawRunner(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: false,
    stdio: options.capture === false ? 'inherit' : 'pipe',
    env: options.env ?? process.env,
  })
  return {
    code: result.status ?? 1,
    stdout: result.stdout?.trim() ?? '',
    stderr: result.stderr?.trim() ?? '',
  }
}

function requireSuccess(result, action) {
  if (result.code !== 0)
    throw new Error(`${action} failed: ${result.stderr || result.stdout || `exit ${result.code}`}`)
  return result
}

function parseJson(value, action) {
  try {
    return JSON.parse(value)
  }
  catch {
    throw new Error(`${action} did not return JSON`)
  }
}

function dopplerSecrets() {
  if (!process.env.DOPPLER_TOKEN)
    throw new Error('DOPPLER_TOKEN is empty')
  const result = requireSuccess(
    run('doppler', ['secrets', 'download', '--no-file', '--format', 'json']),
    'Doppler secret download',
  )
  const secrets = parseJson(result.stdout, 'Doppler secret download')
  assertDopplerEnvironment('preview', secrets.DOPPLER_ENVIRONMENT)
  for (const key of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID']) {
    if (!secrets[key])
      throw new Error(`Doppler preview config is missing ${key}`)
  }
  return secrets
}

function cloudflareEnv(secrets) {
  const env = {
    ...process.env,
    CLOUDFLARE_API_TOKEN: secrets.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ACCOUNT_ID: secrets.CLOUDFLARE_ACCOUNT_ID,
  }
  delete env.DOPPLER_TOKEN
  return env
}

function wrangler(args, secrets, capture = true) {
  return run('pnpm', ['exec', 'wrangler', ...args], {
    capture,
    env: cloudflareEnv(secrets),
  })
}

function resolveVectorize(contract, secrets) {
  const result = requireSuccess(
    wrangler(['vectorize', 'get', contract.name, '--json'], secrets),
    `Vectorize get ${contract.name}`,
  )
  const index = parseJson(result.stdout, 'Vectorize get')
  const dimensions = index.config?.dimensions ?? index.dimensions
  const metric = index.config?.metric ?? index.metric
  if (Number(dimensions) !== contract.dimensions || metric !== contract.metric) {
    throw new Error(
      `Vectorize ${contract.name} contract mismatch: expected ${contract.dimensions}/${contract.metric}`,
    )
  }
  return index
}

function resolveResources(config, secrets) {
  const resolved = previewResourcesFromSecrets(config, secrets)
  if (resolved.vectorize)
    resolved.vectorize = resolveVectorize(config.vectorize, secrets)
  return { resolved }
}

function buildEnvironment(secrets, resources, config) {
  const env = { ...process.env }
  delete env.DOPPLER_TOKEN
  delete env.CLOUDFLARE_API_TOKEN
  for (const [key, value] of Object.entries(secrets)) {
    if (key.startsWith('NUXT_PUBLIC_'))
      env[key] = String(value)
  }
  env.NITRO_PRESET = 'cloudflare_module'
  env.CLOUDFLARE_WORKER_NAME = config.worker
  env.CLOUDFLARE_DEPLOY_ENVIRONMENT = 'preview'
  if (resources.d1)
    env.CLOUDFLARE_D1_DATABASE_ID = resources.d1.uuid
  if (resources.kv)
    env.CLOUDFLARE_KV_NAMESPACE_ID = resources.kv.id
  if (resources.cache)
    env.CLOUDFLARE_CACHE_NAMESPACE_ID = resources.cache.id
  if (resources.r2)
    env.CLOUDFLARE_R2_BUCKET = resources.r2.name
  if (resources.vectorize)
    env.CLOUDFLARE_VECTORIZE_INDEX = config.vectorize.name
  return env
}

export function patchGeneratedConfig(path, config, resources, workersDev) {
  const wranglerConfig = parseJson(readFileSync(path, 'utf8'), 'generated Wrangler config')
  wranglerConfig.name = config.worker
  wranglerConfig.workers_dev = workersDev
  delete wranglerConfig.routes
  delete wranglerConfig.route
  delete wranglerConfig.triggers
  delete wranglerConfig.vars

  if (resources.d1) {
    const database = wranglerConfig.d1_databases?.find(binding => binding.binding === 'DB')
    if (!database)
      throw new Error('Generated config is missing D1 binding DB')
    database.database_id = resources.d1.uuid
    database.migrations_dir = resolve('server/db/migrations/sqlite')
  }
  if (resources.kv) {
    const kv = wranglerConfig.kv_namespaces?.find(binding => binding.binding === 'KV')
    if (!kv)
      throw new Error('Generated config is missing KV binding KV')
    kv.id = resources.kv.id
  }
  if (resources.cache) {
    const cache = wranglerConfig.kv_namespaces?.find(binding => binding.binding === 'CACHE')
    if (!cache)
      throw new Error('Generated config is missing KV binding CACHE')
    cache.id = resources.cache.id
  }
  if (resources.r2) {
    const r2 = wranglerConfig.r2_buckets?.find(binding => ['BLOB', 'BUCKET'].includes(binding.binding))
    if (!r2)
      throw new Error('Generated config is missing R2 binding BLOB or BUCKET')
    r2.bucket_name = resources.r2.name
  }
  if (resources.vectorize) {
    const vector = wranglerConfig.vectorize?.find(binding => binding.binding === 'VECTORIZE')
    if (!vector)
      throw new Error('Generated config is missing Vectorize binding VECTORIZE')
    vector.index_name = config.vectorize.name
  }
  writeFileSync(path, `${JSON.stringify(wranglerConfig, null, 2)}\n`)
}

function syncRuntimeSecrets(config, secrets) {
  const runtimeSecrets = filterRuntimeSecrets(secrets)
  if (Object.keys(runtimeSecrets).length === 0)
    throw new Error('Doppler returned zero allowlisted runtime secrets')
  const directory = mkdtempSync(join(tmpdir(), 'ecosystem-preview-'))
  const path = join(directory, 'worker-secrets.json')
  try {
    writeFileSync(path, JSON.stringify(runtimeSecrets))
    chmodSync(path, 0o600)
    requireSuccess(
      wrangler(['secret', 'bulk', path, '--name', config.worker], secrets, false),
      'Worker secret bulk upload',
    )
  }
  finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

function deploy(config, secrets) {
  const { resolved } = resolveResources(config, secrets)
  requireSuccess(
    run(config.buildCommand[0], config.buildCommand.slice(1), {
      capture: false,
      env: buildEnvironment(secrets, resolved, config),
    }),
    'Nuxt build',
  )
  const configPath = resolve(config.wranglerConfig)
  patchGeneratedConfig(configPath, config, resolved, false)
  if (resolved.d1) {
    requireSuccess(
      wrangler(['d1', 'migrations', 'apply', 'DB', '--remote', '--config', configPath], secrets, false),
      'Preview D1 migration',
    )
  }
  requireSuccess(
    wrangler(['deploy', '--config', configPath, '--name', config.worker], secrets, false),
    'Non-public preview Worker staging deploy',
  )
  syncRuntimeSecrets(config, secrets)
  patchGeneratedConfig(configPath, config, resolved, true)
  requireSuccess(
    wrangler(['deploy', '--config', configPath, '--name', config.worker], secrets, false),
    'Preview Worker deploy',
  )
  console.log(`Preview deployed: ${config.worker}`)
}

function loadConfig(path) {
  const config = parseJson(readFileSync(resolve(path), 'utf8'), 'preview deployment config')
  if (config.schemaVersion !== 1)
    throw new Error(`Unsupported preview deployment schema: ${config.schemaVersion}`)
  const names = previewNames(config.slug)
  if (config.worker !== names.worker)
    throw new Error(`Worker must be ${names.worker}`)
  validateCapabilities(config.resources)
  return config
}

export function main(argv = process.argv.slice(2)) {
  const [mode, configPath] = argv
  if (mode !== 'deploy' || !configPath)
    throw new Error('Usage: cloudflare-preview.mjs deploy <config.json>')
  const config = loadConfig(configPath)
  const secrets = dopplerSecrets()
  deploy(config, secrets)
}

const invoked = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null
if (invoked === import.meta.url) {
  try {
    main()
  }
  catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
