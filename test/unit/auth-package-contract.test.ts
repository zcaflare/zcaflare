import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const nuxtConfig = readFileSync(join(root, 'nuxt.config.ts'), 'utf8')
const workspace = readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8')
const lockfile = readFileSync(join(root, 'pnpm-lock.yaml'), 'utf8')

describe('auth package contract', () => {
  it('keeps the local login page separate from OIDC initiation', () => {
    const authStart = nuxtConfig.indexOf('\n  auth: {')
    const authEnd = nuxtConfig.indexOf('\n  nitro: {', authStart)
    const authConfig = nuxtConfig.slice(authStart, authEnd)

    expect(authConfig).toMatch(/login: '\/auth\/login'/)
    expect(authConfig).toMatch(/signIn: '\/auth\/sign-in'/)
  })

  it('locks the released auth package without the obsolete local patch', () => {
    expect(workspace).toMatch(/'@thecodeorigin\/auth': 0\.0\.8/)
    expect(lockfile).toMatch(/'@thecodeorigin\/auth':\n\s+specifier: 'catalog:'\n\s+version: 0\.0\.8/)
    expect(lockfile).not.toMatch(/'@thecodeorigin\/auth@0\.0\.6'/)
    expect(existsSync(join(root, 'patches/@thecodeorigin__auth@0.0.6.patch'))).toBe(false)
  })
})
