import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { it } from 'vitest'

import {
  assertDopplerEnvironment,
  filterRuntimeSecrets,
  patchGeneratedConfig,
  previewNames,
  previewResourcesFromSecrets,
  validateCapabilities,
} from './cloudflare-preview.mjs'

it('accepts only explicit preview environment labels', () => {
  for (const value of ['dev', 'DEVELOPMENT ', 'preview', 'stg', 'staging'])
    assert.equal(assertDopplerEnvironment('preview', value), value.trim().toLowerCase())
  for (const value of ['', 'prod', 'prd', 'production', 'qa'])
    assert.throws(() => assertDopplerEnvironment('preview', value))
})

it('accepts only prd and prod for production', () => {
  assert.equal(assertDopplerEnvironment('production', ' PRD '), 'prd')
  assert.equal(assertDopplerEnvironment('production', 'prod'), 'prod')
  assert.throws(() => assertDopplerEnvironment('production', 'production'))
  assert.throws(() => assertDopplerEnvironment('production', 'dev'))
})

it('uses a deterministic stable preview Worker name', () => {
  assert.deepEqual(previewNames('zcaflare'), {
    worker: 'zcaflare-preview',
  })
})

it('uploads only NUXT keys and CRON_SECRET', () => {
  assert.deepEqual(filterRuntimeSecrets({
    NUXT_AUTH_SECRET: 'a',
    NUXT_PUBLIC_BASE_DOMAIN: 'b',
    CRON_SECRET: 'c',
    CLOUDFLARE_API_TOKEN: 'never',
    DOPPLER_ENVIRONMENT: 'dev',
    RANDOM_TOKEN: 'never',
  }), {
    NUXT_AUTH_SECRET: 'a',
    NUXT_PUBLIC_BASE_DOMAIN: 'b',
    CRON_SECRET: 'c',
  })
})

it('requires known capabilities and distinct KV/cache identities', () => {
  assert.deepEqual(validateCapabilities(['d1', 'kv', 'cache', 'r2']), ['d1', 'kv', 'cache', 'r2'])
  assert.throws(() => validateCapabilities(['cache-product']))
})

it('loads preview resource bindings from Doppler without creating resources', () => {
  assert.deepEqual(previewResourcesFromSecrets({
    slug: 'zcaflare',
    resources: ['d1', 'kv', 'cache', 'r2'],
  }, {
    CLOUDFLARE_D1_DATABASE_ID: 'preview-db-id',
    CLOUDFLARE_KV_NAMESPACE_ID: 'preview-kv-id',
    CLOUDFLARE_CACHE_NAMESPACE_ID: 'preview-cache-id',
    CLOUDFLARE_R2_BUCKET: 'shared-preview-blob',
  }), {
    d1: { uuid: 'preview-db-id' },
    kv: { id: 'preview-kv-id' },
    cache: { id: 'preview-cache-id' },
    r2: { name: 'shared-preview-blob' },
  })
})

it('rejects missing bindings and a shared KV/cache identity', () => {
  const config = {
    slug: 'zcaflare',
    resources: ['d1', 'kv', 'cache', 'r2'],
  }
  const secrets = {
    CLOUDFLARE_D1_DATABASE_ID: 'preview-db-id',
    CLOUDFLARE_KV_NAMESPACE_ID: 'shared-kv-id',
    CLOUDFLARE_CACHE_NAMESPACE_ID: 'shared-kv-id',
    CLOUDFLARE_R2_BUCKET: 'zcaflare-blob-preview',
  }
  assert.throws(() => previewResourcesFromSecrets(config, {
    ...secrets,
    CLOUDFLARE_D1_DATABASE_ID: '',
  }), /CLOUDFLARE_D1_DATABASE_ID/)
  assert.throws(() => previewResourcesFromSecrets(config, secrets), /distinct/)
})

it('preview patch removes production exposure and applies exact bindings', () => {
  const directory = mkdtempSync(join(tmpdir(), 'preview-config-test-'))
  const path = join(directory, 'wrangler.json')
  try {
    writeFileSync(path, JSON.stringify({
      name: 'production',
      routes: [{ pattern: 'prod.example.com', custom_domain: true }],
      triggers: { crons: ['* * * * *'] },
      vars: { PROD: 'true' },
      d1_databases: [{ binding: 'DB', database_id: 'prod', database_name: 'shared-preview-db' }],
      kv_namespaces: [{ binding: 'KV', id: 'prod-kv' }, { binding: 'CACHE', id: 'prod-cache' }],
      r2_buckets: [{ binding: 'BLOB', bucket_name: 'prod-r2' }],
    }))
    patchGeneratedConfig(path, {
      slug: 'zcaflare',
      worker: 'zcaflare-preview',
    }, {
      d1: { uuid: 'preview-db' },
      kv: { id: 'preview-kv' },
      cache: { id: 'preview-cache' },
      r2: { name: 'shared-preview-blob' },
    }, false)
    const output = JSON.parse(readFileSync(path, 'utf8'))
    assert.equal(output.name, 'zcaflare-preview')
    assert.equal(output.workers_dev, false)
    assert.equal('routes' in output, false)
    assert.equal('triggers' in output, false)
    assert.equal('vars' in output, false)
    assert.equal(output.d1_databases[0].database_id, 'preview-db')
    assert.equal(output.d1_databases[0].database_name, 'shared-preview-db')
    assert.notEqual(output.kv_namespaces[0].id, output.kv_namespaces[1].id)
    assert.equal(output.r2_buckets[0].bucket_name, 'shared-preview-blob')
  }
  finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
