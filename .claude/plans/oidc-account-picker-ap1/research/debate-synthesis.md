# Debate synthesis — OIDC account picker

Two critics ran in parallel (YAGNI/KISS + failure-mode/security), plus prior
self-debate. Each objection → Accept / Reject / Defer.

## YAGNI / KISS critic

| # | Objection | Verdict | Rationale |
|---|-----------|---------|-----------|
| Y1 | Building a multi-account picker for a single-account system; with `multiSession` off it's a one-row "confirm" screen. | **Accept (reframe)** | Kept the page but set expectations: it shows *current account + "Use another account"*. That intermediate screen **is** the user's explicit ask ("choose an account, not the login wizard"). Real N-account list deferred (needs multiSession) — Open Q3. |
| Y2 | Two overlapping mechanisms (module `prompt` path + IdP `selectAccount` page). | **Reject** | Not overlapping — they're the two ends of one flow. The RP *must* send the prompt (it can't render IdP UI); the IdP *must* render the page. Both required. |
| Y3 | The whole solution is "Use another account" (signOut→authorize); drop the page. | **Reject** | That primitive only covers *switching*. The user also wants "Continue as me" (1-click, no re-login) — the reason a picker beats a bare login. Page stays. |
| Y4 | Prefer RP-logout-propagates-to-IdP (terminate SSO at logout). | **Reject** | That's the RP-initiated logout we removed at the user's request ("log out of zcaflare, not of id"). Reintroducing contradicts a settled decision. |
| Y5 | Use `prompt=login`, not `select_account` — no page needed. | **Reject** | `prompt=login` dumps the user into the login form = the "end-to-end login wizard" they explicitly rejected. `select_account` gives the choose-screen. (We *do* use `prompt=login` internally for the "Use another account" redrive — correct there.) |
| Y6 | Cut nuxt-template from this effort. | **Accept** | Moved to Phase 4 (optional follow-up). Bug reported in zcaflare; ship it first. |
| Y7 | The `prompt` allowlist is speculative generality. | **Reject (as security)** | A 4-value `Set` isn't an abstraction — it's boundary validation so the RP can't forward arbitrary/injected authorize params. Kept, tight. |
| Y8 | Module release is heavy churn for one string. | **Accept (acknowledge, unavoidable)** | Confirmed no app-only path to add an authorize param. Release is the cost; made the change minimal + generic so no *future* release is needed for other prompts. |

## Failure-mode / security critic

| # | Finding (sev) | Verdict | Fix folded into plan |
|---|---------------|---------|----------------------|
| F1 | **HIGH** — "Use another account" forwarding stale `sig`/`exp`/`ba_iat` → double-`sig` → `invalid_signature`. | **Accept** | Rebuild the authorize URL from a **clean allowlist** (`AUTHORIZE_PARAMS`); never round-trip provider-internal signed params. |
| F2 | **HIGH** — if `signOut()` fails/races, redrive re-issues the *same* account silently. | **Accept** | "Use another account" redrives with **`prompt=login`**, which forces the login screen regardless of a lingering cookie. Plus try/catch that only navigates on success. |
| F3 | **MED** — idle picker > `exp` (600s) → `/continue` 400 → `result.url` undefined → nav to `undefined`. | **Accept** | `continueAs` catches non-2xx / missing url and **mints a fresh signed picker** (`authorizeUrl({prompt:'select_account'})`). |
| F4 | **MED** — `/continue` needs a live session; expired session → 401 → broken redirect. | **Accept** | Same recovery as F3 (redrive) surfaces the login screen instead of failing silently. |
| F5 | **MED** — deployment ordering: RP sending `select_account` before IdP config → IdP `/error` page (not RP callback), pre-`redirect_uri` validation. | **Accept** | Plan has a hard **"Deployment ordering"** section: IdP first, then module publish, then RP. |
| F6 | INFO — `shouldRedirect:()=>false` correctly limits the picker to explicit prompt; no silent-SSO regression. | **Accept (confirms design)** | — |
| F7 | INFO — no redirect loop: both re-entry paths strip the triggering prompt (`removePromptFromQuery`), and re-entry runs with `isAuthorize` falsy. | **Accept (confirms design)** | — |
| F8 | LOW — injection contained by mandatory `sig` verification on `/continue`; keep it, never trust picker query without the sig round-trip. | **Accept** | Page only uses raw `location.search` as `oauth_query` for the signed `/continue`; the authorize redrive uses the clean allowlist. |
| F9 | LOW — cookie-clear vs nav race is low (same-origin, awaited). | **Accept** | Covered by F2's `prompt=login` belt. |

## Net effect on the plan

- Design **validated** (loop-free, silent-SSO preserved, injection contained).
- Hardened the picker page: clean-allowlist authorize rebuild, `prompt=login`
  on switch, fresh-picker recovery on expiry/401.
- Scope trimmed: nuxt-template → optional Phase 4; multiSession → deferred.
- Deployment ordering made explicit (IdP → module publish → RP).
