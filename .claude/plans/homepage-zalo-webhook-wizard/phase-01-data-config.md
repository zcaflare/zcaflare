# Phase 01 — Data + config foundation

Creates the `zalo` layer scaffold, the `zalo_webhooks` table, the bounce-server
runtime config, and generates the migration. Must complete (incl. `nuxt
prepare` + `db:generate`) before phases 03–04 can import `@nuxthub/db/schema`.

## Step 1 — Layer scaffold

### `layers/zalo/package.json`
```json
{
  "name": "@layers/zalo",
  "type": "module",
  "private": true,
  "main": "./nuxt.config.ts"
}
```

### `layers/zalo/nuxt.config.ts`
```ts
export default defineNuxtConfig({
  $meta: {
    name: 'zalo',
  },
})
```

> Auto-discovered — do **not** add to root `extends`. Add the workspace dep so
> pnpm links it like the other layers.

### Edit `package.json` (root) — add to `devDependencies` (keep alphabetical near the other `@layers/*`)
```jsonc
    "@layers/zalo": "workspace:*",
```

## Step 2 — `zalo_webhooks` table

### `layers/zalo/server/db/schema.ts`
```ts
import type { InferSelect } from '~~/server/db/types'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// One row per Zalo webhook, 1:1 with a project (project_id is the PK). No
// cross-layer FK to projects: the schema files are bundled independently for
// drizzle-kit and the #layers alias is not guaranteed to resolve there — the
// relationship is enforced in application code (same convention as the
// selfhost layer, which references organization_id without an FK).
export const zaloWebhookTable = sqliteTable('zalo_webhooks', {
  project_id: text('project_id').primaryKey().notNull(),
  session_id: text('session_id').notNull(),
  callback_url: text('callback_url').notNull(),
  // Webhook signing secret, AES-GCM encrypted via authSecret (server/utils/crypto.ts).
  // Never log, never return except through the owner-only reveal route.
  secret_ciphertext: text('secret_ciphertext').notNull(),
  secret_iv: text('secret_iv').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  uniqueIndex('zalo_webhooks_session_unique').on(table.session_id),
])
export type ZaloWebhook = InferSelect<typeof zaloWebhookTable>
```

## Step 3 — Validation schema (callbackUrl SSRF guard)

### `layers/zalo/shared/schemas/zalo.ts`
```ts
import { z } from 'zod'

// Block localhost / loopback / RFC-1918 / link-local literals. Defense in
// depth against using the bounce server as an SSRF relay (the bounce server
// makes the outbound webhook call to whatever we forward).
const PRIVATE_HOST_RE = /^(?:localhost|127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0|\[?::1\]?|172\.(?:1[6-9]|2\d|3[01])\.)/i

export const ZaloLoginSchema = z.object({
  callbackUrl: z.string().url().refine((value) => {
    let url: URL
    try {
      url = new URL(value)
    }
    catch {
      return false
    }
    if (url.protocol !== 'https:')
      return false
    if (PRIVATE_HOST_RE.test(url.hostname))
      return false
    return true
  }, 'Callback URL must be a public https:// URL'),
})

export type ZaloLogin = z.infer<typeof ZaloLoginSchema>
```

> Note: this also blocks `http://localhost` callbacks in local dev. To test the
> end-to-end webhook delivery in dev, use a public https tunnel
> (e.g. a Cloudflare quick tunnel). If that proves painful, cook may gate the
> `https`/private checks behind `!import.meta.dev` — but ship strict by default.

## Step 4 — Bounce server runtime config

### Edit `nuxt.config.ts` — add to `runtimeConfig` (private, server-only; place near `githubRepository`)
```ts
    // Base URL of the zcaflare bounce server (Zalo QR-login + webhook relay).
    bounceServerUrl: 'https://zcaflare.thecodeorigin.com',
```

### Edit `nuxt.config.ts` — point post-login landing at the new homepage
In the `auth` block, change:
```ts
      home: '/dashboard',
```
to:
```ts
      home: '/',
```
> `/dashboard` stays reachable directly; the new `/` is the primary home.

### Edit `.env.example` and `.env` — add under a new section
```
# =============================================================================
# Zalo bounce server (QR-login + webhook relay)
# =============================================================================
NUXT_BOUNCE_SERVER_URL=https://zcaflare.thecodeorigin.com
```

## Step 5 — Regenerate types + migration

```bash
pnpm dlx nuxt prepare      # or: pnpm prepare — regenerates .nuxt/hub/db/schema.entry.ts (picks up the new layer)
pnpm db:generate           # creates server/db/migrations/sqlite/00XX_*.sql for zalo_webhooks
pnpm db:migrate            # applies to local .data
```
Expected: a new migration file under `server/db/migrations/sqlite/` containing
`CREATE TABLE \`zalo_webhooks\``. **Commit the migration.**

Verify the table exists locally:
```bash
pnpm cli db sql "SELECT name FROM sqlite_master WHERE type='table' AND name='zalo_webhooks'"
```
Expected output: a row with `zalo_webhooks`.

## Done when

- `layers/zalo/` scaffolded and linked in the workspace.
- `zalo_webhooks` migration generated, applied locally, committed.
- `bounceServerUrl` in runtime config; `NUXT_BOUNCE_SERVER_URL` in `.env`.
- `pnpm typecheck` passes (no consumers yet, but the schema must compile).
