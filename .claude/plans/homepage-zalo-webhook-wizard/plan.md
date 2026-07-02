# Plan — Homepage: Create-a-Zalo-Webhook wizard + interactive docs

## Open questions / risks (read first)

1. **Bounce login latency on the _success_ path is unverified.** We only
   observed the failure path (`POST /api/zalo/auth/login` took ~105s then
   `500 "Failed to start Zalo QR login → ZcaApiError: Cannot get scan
   result"`). v1 proxies the login **synchronously** with a 25s
   `AbortSignal.timeout`. **If real-world success latency exceeds ~20s**, the
   login must move to an async/job pattern (return a handle immediately,
   produce the QR out-of-band). That is a deliberate follow-up, not in this
   plan. Cook should time a real successful login and flag if it's slow.
2. **Exact bounce `status` strings are unconfirmed.** We treat
   `status === 'authenticated'` as success, a small allowlist
   (`expired|qr_expired|timeout|failed|error`) as terminal-expired, and
   everything else as still-pending. Cook must verify the real values against
   one live successful login and adjust `phaseFromBounceStatus`.
3. **QR image origin/format unconfirmed** → normalized server-side to a
   `data:` URL (`img-src 'self' data:` already allowed). **No CSP change
   needed.** If the bounce server ever returns a huge QR, revisit.

None of the above block implementation — the defensive handling covers them.

## Goal

Replace the placeholder homepage (`app/pages/index.vue`, currently a redirect
to `/dashboard`) with the product's front door: an interactive
"how it works" doc plus a wizard that

1. takes a **callback URL** (`<UInput>`),
2. starts **"Sign in with Zalo"** against the bounce server
   (`https://zcaflare.thecodeorigin.com`), shows the **QR** and **polls**
   status through a safe server-side proxy,
3. on success **creates a project** (the Zalo webhook) under the user's org
   and reveals the **webhook signing secret** (stored AES-GCM encrypted,
   re-viewable later),
4. documents the **HMAC signature verification** the user must add to their
   own server.

The homepage requires a ZcaFlare (THECODEORIGIN) session and renders inside
the existing dashboard shell (per product decisions).

## Approach

A new **`zalo` layer** owns the integration. Each completed Zalo sign-in
reuses the existing org-scoped **`project`** model (one project == one Zalo
webhook) plus a 1:1 **`zalo_webhooks`** row holding the binding + the
encrypted secret. A server-side **bounce service** wraps the two external
endpoints; two proxy routes (`login`, `status`) drive the wizard and a third
(`webhooks/[id]`) reveals the secret to the owner. Project creation is
extracted into a reusable **project-layer service** shared by the existing
create route and the new status route.

### Why this shape (rejected alternatives)

- **Standalone `zalo_webhooks` table with its own `owner_id`, skipping
  `project`** — rejected. `project` already encodes org scoping, owner
  membership, status, listing UI, and CASL tenancy; a standalone table
  re-derives all of it. Unused product/member join rows cost nothing for a
  1:1 row. (Architecture critic: keep.)
- **Reveal-once / never store the secret** — rejected. The user chose
  encrypted-at-rest + re-viewable. Webhook secrets get lost; reveal-once
  forces rotation churn.
- **Async job for the slow bounce login** — deferred to a follow-up. v1 is a
  bounded synchronous proxy (scope: "wire it up for now").
- **Add the R2 origin to CSP + render QR from its URL** — rejected in favor of
  server-side `data:` normalization (origin unconfirmed; avoids CSP
  guesswork; ~5 lines).

## Security / correctness decisions (from debate)

| Risk (critic) | Decision |
|---|---|
| Worker timeout on slow bounce login (P0) | 25s `AbortSignal.timeout`; clean 502; async deferred + documented |
| Concurrent polls create orphan project (P0) | Client **serializes** polls; `session_id` UNIQUE + `onConflictDoNothing` + read-back; loser deletes its orphan project |
| `defineAuthorizedHandler` ignores ability checks (P0) | Our routes use `defineAuthenticatedHandler` + **explicit per-resource ownership checks** (KV `sub` match; project membership), not ability theater |
| SSRF via `callbackUrl` (P1) | Zod: require public `https://`, reject localhost / RFC-1918 / link-local hosts |
| Secret in poll response → logs (P1) | Status returns only `{ phase, projectId }`; secret only via owner-only `webhooks/[id]` |
| `activeOrg` null (P1) | Guard early → `400 No active organization` |
| Encryption key derived from `authSecret` (P1) | **Keep** — matches selfhost convention; dedicated key is a global concern, out of scope (documented) |
| KV TTL forfeits live session (P2) | Distinct `expired` phase on KV miss; 30-min TTL |
| Double-submit spawns extra bounce sessions (P2) | Client disables button while in-flight + per-user KV rate-limit (1 / 10s) |
| Per-isolate rate limiter ineffective (P2) | KV-backed login rate-limit (above); global limiter unchanged (out of scope) |

## Permission impact

- **No new ability keys.** Creating one's own webhook/project is allowed for
  any authenticated org member. No edits to
  `layers/auth/shared/permissions.ts`, `SYSTEM_GRANTS`, or
  `DEFAULT_*_ABILITIES`. No live-env backfill task.
- Access control is **per-resource ownership** (KV `sub` match on status;
  project membership on `webhooks/[id]`), because the installed
  `@thecodeorigin/auth` ignores `defineAuthorizedHandler` checks.
- New sidebar item ("Home" → `/`) is ungated.

## Data-write paths

All writes happen through **validated server routes** (sanctioned per hard
rule 15) calling thin services — no Nitro task / seed needed (these are
user-driven):

- `createProject` / `deleteProject` → `layers/project/server/services/project.ts`
- `createZaloWebhook` (encrypts) → `layers/zalo/server/services/webhook.ts`
- Idempotency: `session_id` UNIQUE + `onConflictDoNothing` + read-back.

## Phase table

| Phase | File | What |
|---|---|---|
| 01 | `phase-01-data-config.md` | New `zalo` layer scaffold, `zalo_webhooks` table, runtime config + env, migration |
| 02 | `phase-02-project-service.md` | Extract `createProject`/`deleteProject` service; refactor `projects/index.post.ts` |
| 03 | `phase-03-server-integration.md` | Bounce service, webhook service, `login` + `status` + `webhooks/[id]` routes |
| 04 | `phase-04-frontend.md` | `useZaloApi`, `useZaloWizard`, `ZaloWebhookWizard`, `ZaloWebhookDocs`, `webhooks/[id]` page, sidebar plugin, homepage rewrite |
| 05 | `phase-05-tests-docs.md` | Unit tests (schema + bounce helpers), layer `CLAUDE.md`, lint/typecheck/test gate |

## Cross-phase file map

**New (zalo layer)**
```
layers/zalo/package.json                                   (01)
layers/zalo/nuxt.config.ts                                 (01)
layers/zalo/CLAUDE.md                                      (05)
layers/zalo/server/db/schema.ts                            (01)
layers/zalo/shared/schemas/zalo.ts                         (01)
layers/zalo/server/services/bounce.ts                      (03)
layers/zalo/server/services/webhook.ts                     (03)
layers/zalo/server/api/zalo/login.post.ts                  (03)
layers/zalo/server/api/zalo/[sessionId]/status.get.ts      (03)
layers/zalo/server/api/zalo/webhooks/[id].get.ts           (03)
layers/zalo/app/api/useZaloApi.ts                          (04)
layers/zalo/app/composables/useZaloWizard.ts               (04)
layers/zalo/app/components/Zalo/ZaloWebhookWizard.vue      (04)
layers/zalo/app/components/Zalo/ZaloWebhookDocs.vue        (04)
layers/zalo/app/pages/webhooks/[id].vue                    (04)
layers/zalo/app/plugins/99.contribute.zalo.client.ts       (04)
layers/zalo/test/unit/zalo-schema.test.ts                  (05)
layers/zalo/test/unit/bounce-service.test.ts               (05)
```
**New (project layer)**
```
layers/project/server/services/project.ts                  (02)
```
**Edited**
```
layers/project/server/api/projects/index.post.ts           (02)
nuxt.config.ts            (runtimeConfig.bounceServerUrl, auth.routes.home)  (01)
.env.example / .env       (NUXT_BOUNCE_SERVER_URL)          (01)
app/pages/index.vue       (rewrite)                         (04)
```

## Test strategy

- **Unit (node):** `zalo-schema.test.ts` (callbackUrl accepts public https;
  rejects http / localhost / 192.168.x / non-URL); `bounce-service.test.ts`
  (URL building, `x-webhook-secret` header, `phaseFromBounceStatus` mapping,
  `normalizeQrToDataUrl` passthrough of `data:`), with `$fetch` stubbed.
- **Encrypt/decrypt** is the already-trusted `crypto.ts` util (uses
  `useRuntimeConfig`/`createError` Nitro globals — awkward to unit-test in
  node, no existing test); covered indirectly. Not unit-tested here.
- **Full wizard e2e is deferred** — completing the flow needs a bounce-server
  test double (server-to-server `$fetch` can't be intercepted by Playwright).
  A lightweight e2e asserting the homepage renders the wizard + docs and the
  callback input validates client-side may be added, but is optional.
- Gate before "done": `pnpm lint && pnpm typecheck && pnpm test`.

## Acceptance criteria

- [ ] `/` renders inside the dashboard shell with a "How it works" doc + a
      wizard; unauthenticated visitors are redirected to sign-in.
- [ ] Entering a public `https` callback URL and clicking "Sign in with Zalo"
      calls `POST /api/zalo/login`, shows a QR, and polls
      `GET /api/zalo/:sessionId/status` (serialized, ≤5 min).
- [ ] A non-https / localhost / private-IP callback URL is rejected with a
      clear message and never reaches the bounce server.
- [ ] On bounce `authenticated`, exactly one project + one `zalo_webhooks`
      row are created under the caller's org; concurrent/duplicate polls do
      not leave an orphan project.
- [ ] The webhook secret is **never** in a status response or log; it is
      fetched once from `GET /api/zalo/webhooks/:id` (owner-only) and shown
      with a copy button on the success step and the webhook detail page.
- [ ] The docs show the HMAC verification snippet, substituting the real
      secret when available, else a `<YOUR_WEBHOOK_SECRET>` placeholder.
- [ ] `GET /api/zalo/webhooks/:id` returns 403 to a non-member.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` all green.

## Suggested cook invocation

```
/cook .claude/plans/homepage-zalo-webhook-wizard/plan.md
```
Execute phases 01 → 05 in order. Phase 01 must run `nuxt prepare` +
`pnpm db:generate` before later phases can import `@nuxthub/db/schema`.
