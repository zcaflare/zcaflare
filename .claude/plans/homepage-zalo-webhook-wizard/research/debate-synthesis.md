# Debate synthesis

Three critics ran in parallel against the v1 design: YAGNI, failure-mode/security, architecture.

## Decisions

| # | Objection (critic) | Verdict | Action / rationale |
|---|---|---|---|
| 1 | Synchronous proxy of 50–105s bounce login exceeds Worker limits (security P0, arch #2) | **Accept (mitigate) + Defer** | 25s `AbortSignal.timeout`; clean 502 on failure; client shows "busy, try again". Full async/job pattern deferred — the 105s was the *failure* path; success latency unverified. Documented as risk #1. |
| 2 | Concurrent status polls create an orphan project (security P0) | **Accept** | Client serializes polls (awaits each before scheduling next). Server: `session_id` UNIQUE + `onConflictDoNothing` + read-back returns the canonical winner; if the loser's freshly-created project ≠ winner, it deletes the orphan. Bounds residue to the rare two-tab case, then cleans it. |
| 3 | `defineAuthorizedHandler` ignores ability checks → authz bypass (security P0) | **Accept (reframe)** | Module-wide reality, not specific to this feature. Our routes intentionally use `defineAuthenticatedHandler` (any logged-in user may create *their own* webhook) and enforce **explicit per-resource ownership** (KV `sub` match; project membership on reveal). No reliance on ability gating. |
| 4 | SSRF via free-text `callbackUrl` (security P1) | **Accept** | Zod refinement: require `https:`, reject `localhost`/RFC-1918/link-local/`::1` hostnames before the value is forwarded. Defense-in-depth (bounce server should also guard). |
| 5 | `webhookSecret` returned in every poll response → log/DevTools exposure (security P1) | **Accept** | Status returns only `{ phase, projectId }`. Secret disclosed solely via owner-only `GET /api/zalo/webhooks/:id`. Also gives a recovery path if the success poll's response is lost. |
| 6 | `activeOrg` null unguarded (security P1) | **Accept** | Guard in `login.post.ts` → `400 No active organization` (matches existing `projects/index.post.ts`). |
| 7 | Encryption key = SHA-256(authSecret); rotating authSecret bricks ciphertexts (security P1) | **Reject (keep) + note** | Reuse `server/utils/crypto.ts` to match the established selfhost pattern (CF tokens use the same). A dedicated, independently-rotatable key is a cross-cutting change for *all* encrypted secrets — out of scope; recorded as a known tradeoff. |
| 8 | KV TTL expiry forfeits a live authenticated Zalo session (security P2) | **Accept (partial)** | 30-min TTL; status returns a distinct `expired` phase on KV miss (not a 404) so the UI can prompt a restart. Reclaiming an already-authenticated-but-expired session from the bounce server is out of scope. |
| 9 | Double-submit spawns extra bounce sessions (security P2) | **Accept** | Client disables the button while a login is in-flight; per-user KV rate-limit `zalo:login-rl:{sub}` (1 / 10s). Residual orphan bounce sessions TTL out upstream — acceptable for v1. |
| 10 | Per-isolate lru-cache rate limiter is ineffective (security P2) | **Defer** | Global infra concern. We add a KV-backed limit on the login route specifically (#9); the app-wide limiter is unchanged. |
| 11 | Drop encrypted storage + reveal endpoint (YAGNI #1) | **Reject** | User explicitly chose store-encrypted / re-viewable. Architecture critic also recommends keep (secret loss / rotation churn). |
| 12 | Drop server-side QR normalization; add R2 to CSP (YAGNI #2) | **Reject** | QR origin unconfirmed (login was failing); `data:` is already CSP-allowed; ~5 lines. Avoids guessing the R2 host. |
| 13 | Drop `status` column from `zalo_webhooks` (YAGNI #3) | **Accept** | Row exists only after `authenticated`; a column that's always one value is dead weight. |
| 14 | Drop `events` json column (YAGNI #4) | **Accept** | Bounce `callbackEvents` is optional and the UI doesn't expose it. Add when the API surfaces filtering. |
| 15 | Skip `createProject` service extraction (YAGNI #5) | **Reject** | Architecture critic explicitly endorsed extraction ("otherwise membership creation silently diverges"). Two callers now (existing create route + status route). Aligns with hard rule 15. |
| 16 | Replace wizard FSM with a plain ref (YAGNI #6) | **Accept** | `phase` is a plain `ref<'callback'|'scanning'|'done'|'error'>`. A thin composable still owns the polling lifecycle + unmount cleanup (testable, non-trivial), but no FSM library. |
| 17 | Inline `ZaloWebhookDocs` (YAGNI #7) | **Reject** | The docs block is reused on both the homepage and the webhook detail page → component. |

## Architecture critic confirmations (kept as-is)

- Reuse `project` model (vs standalone table): **keep**. Orphan worry is moot —
  we create the project only on `authenticated`, never at login, so abandoned
  logins create no project (only a KV entry that TTLs out).
- New `zalo` layer (vs extending another): **keep**.
- Client polling at 2.5s: **keep** (added a hard cap + serialization).
- Encrypt-at-rest + reveal endpoint: **keep**.

## Biggest residual risk

The synchronous bounce-login proxy (#1). Acceptable for v1 with a timeout;
revisit with an async pattern if a *successful* login is observed to be slow.
