# Phase 05 — Tests + layer docs + gate

Unit tests for the pure, high-value logic (no brittle external mocks), the
layer `CLAUDE.md` trace, and the final CI gate.

## Step 1 — Schema validation test

### `layers/zalo/test/unit/zalo-schema.test.ts`
```ts
import { describe, expect, it } from 'vitest'
import { ZaloLoginSchema } from '#layers/zalo/shared/schemas/zalo'

describe('zaloLoginSchema.callbackUrl', () => {
  it('accepts a public https URL', () => {
    expect(ZaloLoginSchema.parse({ callbackUrl: 'https://example.com/hook' }))
      .toEqual({ callbackUrl: 'https://example.com/hook' })
  })

  it.each([
    ['http (not https)', 'http://example.com/hook'],
    ['localhost', 'https://localhost/hook'],
    ['loopback ip', 'https://127.0.0.1/hook'],
    ['rfc-1918 192.168', 'https://192.168.1.10/hook'],
    ['rfc-1918 10.x', 'https://10.0.0.5/hook'],
    ['rfc-1918 172.16', 'https://172.16.0.1/hook'],
    ['link-local', 'https://169.254.1.1/hook'],
    ['not a url', 'not-a-url'],
  ])('rejects %s', (_label, callbackUrl) => {
    expect(() => ZaloLoginSchema.parse({ callbackUrl })).toThrow()
  })
})
```

## Step 2 — Bounce pure-helper test

Covers the logic that has no external dependency. URL building + header
behavior are validated by the manual probe in phase 03 (mocking `#imports` +
`ofetch` here would be brittle and low-value).

### `layers/zalo/test/unit/bounce-service.test.ts`
```ts
import { describe, expect, it } from 'vitest'
import { normalizeQrToDataUrl, phaseFromBounceStatus } from '#layers/zalo/server/services/bounce'

describe('phaseFromBounceStatus', () => {
  it('maps authenticated', () => {
    expect(phaseFromBounceStatus('authenticated')).toBe('authenticated')
  })

  it.each(['expired', 'qr_expired', 'timeout', 'failed', 'error'])('maps %s to expired', (s) => {
    expect(phaseFromBounceStatus(s)).toBe('expired')
  })

  it.each(['pending', 'waiting_scan', 'qr_generated', 'anything-else'])('maps %s to pending', (s) => {
    expect(phaseFromBounceStatus(s)).toBe('pending')
  })
})

describe('normalizeQrToDataUrl', () => {
  it('passes a data: URL through untouched (no network)', async () => {
    const dataUrl = 'data:image/png;base64,AAAA'
    expect(await normalizeQrToDataUrl(dataUrl)).toBe(dataUrl)
  })
})
```

> If cook adds a `$fetch`-mocked test for `loginZalo`/`getZaloStatus`, stub both
> `ofetch` and `#imports` `useRuntimeConfig` (return `{ bounceServerUrl: '...' }`).
> Optional — not required to ship.

## Step 3 — Layer CLAUDE.md

### `layers/zalo/CLAUDE.md`
```md
# layers/zalo

> Self-contained Nuxt layer that integrates the external **bounce server**
> (`zcaflare.thecodeorigin.com`) — Zalo QR sign-in + signed webhook relay —
> and drives the homepage "create a Zalo webhook" wizard. Auto-discovered from
> `<root>/layers/zalo/`.

## What this layer owns

| Concern | Where |
|--------|------|
| `zalo_webhooks` table (1:1 with a project; encrypted signing secret) | `server/db/schema.ts` |
| Callback-URL validation (https + no private hosts) | `shared/schemas/zalo.ts` |
| Bounce server wrappers + status mapping + QR→dataURL | `server/services/bounce.ts` |
| Webhook persistence (encrypt) + owner-only reveal | `server/services/webhook.ts` |
| Start-login proxy (`POST /api/zalo/login`) | `server/api/zalo/login.post.ts` |
| Status poll proxy (`GET /api/zalo/[sessionId]/status`) — creates project + webhook on success | `server/api/zalo/[sessionId]/status.get.ts` |
| Owner-only secret reveal (`GET /api/zalo/webhooks/[id]`) | `server/api/zalo/webhooks/[id].get.ts` |
| Client API wrappers | `app/api/useZaloApi.ts` |
| Wizard polling lifecycle | `app/composables/useZaloWizard.ts` |
| Wizard + docs components | `app/components/Zalo/*` |
| Webhook detail page | `app/pages/webhooks/[id].vue` |
| Sidebar "Home" link | `app/plugins/99.contribute.zalo.client.ts` |

## Key invariants

- **A completed Zalo sign-in == one project + one `zalo_webhooks` row.** The
  project is created only when the bounce status is `authenticated`, never at
  login — abandoned logins leave nothing but a KV entry that expires.
- **The signing secret never appears in a status response or a log.** It is
  disclosed only through `webhooks/[id]`, gated by project membership.
- **Ownership is checked explicitly** (KV `sub` match on status; project
  membership on reveal) because `@thecodeorigin/auth`'s
  `defineAuthorizedHandler` ignores its ability-check argument in this version.
- The secret is **AES-GCM encrypted at rest** via `~~/server/utils/crypto.ts`
  (key = SHA-256 of `authSecret`) — same convention as the selfhost layer.

## Cross-layer references

- `createProject` / `deleteProject` from
  `#layers/project/server/services/project`.
- Tables/types from `@nuxthub/db/schema`; KV from `@nuxthub/kv`; crypto from
  `~~/server/utils/crypto`.

## Config

- `runtimeConfig.bounceServerUrl` (env `NUXT_BOUNCE_SERVER_URL`,
  default `https://zcaflare.thecodeorigin.com`).

## Known limitations / follow-ups

- The bounce login is proxied **synchronously** with a 25s timeout. If a
  *successful* login is observed to be slow, move it to an async/job pattern.
- Bounce `status` string values are inferred — verify `phaseFromBounceStatus`
  against a live success.
- Encryption key is derived from `authSecret`; rotating `authSecret` makes
  stored secrets undecryptable (shared codebase tradeoff).
```

## Step 4 — Gate

```bash
pnpm lint
pnpm typecheck
pnpm test
```
All three must be green. Manually click through `/` while signed in (see phase
03/04 done-criteria). Use the running dev server / preview URL — for UI work
prefer the preview deploy over `pnpm dev` alone.

## Done when

- New unit tests pass under `pnpm test` (root + layers).
- `layers/zalo/CLAUDE.md` committed.
- Lint + typecheck + test all green; manual homepage walkthrough done.
