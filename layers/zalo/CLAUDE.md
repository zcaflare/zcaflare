# layers/zalo

> Self-contained Nuxt layer that integrates the external **bounce server**
> (`zca.thecodeorigin.com`) — Zalo QR sign-in + signed webhook relay —
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
| Conflict resolution (`POST /api/zalo/[sessionId]/conflict`) — settles a re-login that collided with another webhook | `server/api/zalo/[sessionId]/conflict.post.ts` |
| Every `zca-js` action (`POST /api/zalo/[sessionId]/actions/[action]`) — one route, one registry | `server/api/zalo/[sessionId]/actions/[action].post.ts`, `server/services/zalo-actions.ts` |
| Client API wrappers | `app/api/useZaloApi.ts` |
| Wizard polling lifecycle | `app/composables/useZaloWizard.ts` |
| Wizard + docs components | `app/components/Zalo/*` |
| Webhook detail page | `app/pages/webhooks/[id].vue` |
| Sidebar "Home" link | `app/plugins/99.contribute.zalo.client.ts` |

## Key invariants

- **One route for all 145 Zalo actions, never one route each.** Nitro types every
  route into a single generated map, and at ~198 routes TypeScript exceeds its
  instantiation depth resolving *any* typed `$fetch` call in the app — typecheck
  then fails in unrelated layers (TS2589) with nothing to fix at the call site.
  A new action is a new entry in `server/services/zalo-actions.ts`, not a new file
  under `actions/`. That registry is also the allowlist: a name absent from it is
  never dispatched to core.
- **URL segments are kebab-case; `zca-js` method names stay camelCase.**
  `POST …/actions/send-message` dispatches `api.sendMessage(...)`. The camelCase
  name is core's wire vocabulary, not this layer's naming.

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
  default `https://zca.thecodeorigin.com`).

## Known limitations / follow-ups

- The bounce login is proxied **synchronously** with a 25s timeout. If a
  *successful* login is observed to be slow, move it to an async/job pattern.
- Encryption key is derived from `authSecret`; rotating `authSecret` makes
  stored secrets undecryptable (shared codebase tradeoff).
