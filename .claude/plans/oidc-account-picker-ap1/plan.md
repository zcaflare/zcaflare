# Plan — "Choose an account" after logout (OIDC `prompt=select_account`)

## Open questions (answer before cook starts)

1. **Second module publish?** The RP can only influence the `/oauth2/authorize`
   URL through the published `@thecodeorigin/auth` module. Sending
   `prompt=select_account` requires a module change → **publish `0.0.6`** and
   bump both app catalogs. This is the 2nd release in a day. **Recommendation:
   yes** — there is no app-only way to add an authorize param (the module owns
   `/auth/login`). Confirmed by research (`sign-in.get.ts` builds the URL).
2. **When does the picker show?** **Recommendation: only after an explicit
   logout** (the `?loggedout` screen's "Sign in" button), *not* on every
   sign-in. Normal first-load auto-login stays `signIn('/')` with no prompt, so
   seamless SSO is preserved for the common case. `shouldRedirect: () => false`
   guarantees the picker never fires for other clients or normal logins.
3. **Enable `multiSession`?** **Recommendation: no (defer).** It is OFF today →
   one account per browser. The picker will show **the current account +
   "Use another account"**, which satisfies the request ("choose an account,
   not the login wizard") and lets the user switch. A *true* multi-account list
   (Google-style N accounts) needs the better-auth `multiSession` plugin +
   `multiSessionClient` — a broad session-model change, out of scope here.
   Tracked as a follow-up.
4. **Apply to `nuxt-template` now?** **Recommendation: follow-up.** The bug was
   reported in zcaflare. The module + IdP work is shared; only the one-line RP
   trigger differs. Ship zcaflare first, then mirror to nuxt-template (Phase 4,
   optional).

## Goal

After logging out of zcaflare (local-only logout — IdP SSO session stays
alive), signing in again must **not** silently re-authenticate the same user.
Instead the IdP shows a **"Choose an account"** screen: *Continue as {current
user}* or *Use another account*. This lets the user sign in as a different
account without a full end-to-end login wizard.

## Root cause (confirmed)

The RP's `/oauth2/authorize` request sends **no `prompt`**. Per OIDC, with an
active IdP SSO session and no prompt, the provider silently issues a code
(`@better-auth/oauth-provider` `runOAuth2Authorize`). The provider *does*
support `prompt=select_account`, but (a) the RP never sends it and (b) it
requires a configured `selectAccount.page` (else it errors
`unsupported_prompt_select_account`).

## Approach

Three coordinated changes (RP sends the prompt → IdP renders a picker → picker
resumes the flow):

| # | Repo | Change |
|---|------|--------|
| 1 | `@thecodeorigin/auth` module (`better-auth/packages/auth`) | `signIn()` accepts optional `prompt`; sign-in route forwards an allowlisted `prompt` to `/oauth2/authorize`. Publish `0.0.6`. |
| 2 | IdP app (`better-auth`) | Add `selectAccount` to `oauthProvider`; build `/oauth/select-account` page that resumes via `/oauth2/continue`. |
| 3 | zcaflare | Post-logout "Sign in" button passes `prompt: 'select_account'`; bump catalog to `0.0.6`. |
| 4 | nuxt-template (optional/follow-up) | Same one-line RP trigger + catalog bump. |

### Rejected alternatives (see `research/debate-synthesis.md`)

- **`prompt=login`** (no picker page): simpler, but drops the user straight
  into the login form — the "end-to-end login wizard" the user explicitly
  rejected. ❌
- **RP-initiated IdP logout on sign-out** (terminate SSO at logout): this is the
  RP-initiated logout we *removed* on the user's request ("log out of zcaflare,
  not of id"). Reintroducing it contradicts that decision. ❌
- **Force picker via `shouldRedirect: () => true`**: would show the picker for
  *every* client on *every* login. Too broad. ❌

## Deployment ordering (hard requirement)

`unsupported_prompt_select_account` is returned (to the **IdP's own `/error`
page**, before `redirect_uri` is validated) if the RP sends
`prompt=select_account` while the IdP lacks the `selectAccount` config. So:

1. **Deploy IdP first** (Phase 2: `selectAccount` config + page).
2. **Then publish module `0.0.6`** (Phase 1).
3. **Then deploy the RP apps** with catalog `0.0.6` + the trigger (Phase 3/4).

The reverse-safe direction: IdP ready but RP old is harmless
(`shouldRedirect:false` → picker never forced).

---

## Phase 1 — Module: forward `prompt` (`better-auth/packages/auth`)

### 1a. `src/runtime/app/composables/useAuth.ts` — `signIn` gains a `prompt` option

Replace the current `signIn`:

```ts
type SignInPrompt = 'login' | 'select_account' | 'consent' | 'none'

function signIn(redirect?: string, options?: { prompt?: SignInPrompt }) {
  const params = new URLSearchParams()
  if (redirect)
    params.set('redirect', redirect)
  if (options?.prompt)
    params.set('prompt', options.prompt)
  const qs = params.toString()
  return navigateTo(qs ? `${routes.signIn}?${qs}` : routes.signIn, { external: true })
}
```

(`navigateTo`/`routes` remain used, so no unused-var lint.)

### 1b. `src/runtime/server/routes/sign-in.get.ts` — forward an allowlisted `prompt`

Add the allowlist + read + forward. Full file:

```ts
import { createError, defineEventHandler, getQuery, sendRedirect, setCookie } from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'
import { withQuery } from 'ufo'
import { callbackRedirectUri, pkceChallenge, randomString, safePath } from '../utils/oidc'

// OIDC prompt values we allow the RP to forward to the IdP authorize endpoint.
const ALLOWED_PROMPTS = new Set(['login', 'select_account', 'consent', 'none'])

export default defineEventHandler(async (event) => {
  const { auth: runtimeConfig, public: { auth: publicRuntimeConfig } } = useRuntimeConfig()
  if (!publicRuntimeConfig.domain || !publicRuntimeConfig.clientId || !runtimeConfig.clientSecret)
    throw createError({ statusCode: 503, statusMessage: 'Auth not configured' })

  const query = getQuery(event)
  const state = randomString(32)
  const verifier = randomString(64)
  const redirectTo = safePath(query.redirect as string | undefined, publicRuntimeConfig.routes.home)
  const prompt = typeof query.prompt === 'string' && ALLOWED_PROMPTS.has(query.prompt) ? query.prompt : undefined
  const opts = { httpOnly: true, secure: !import.meta.dev, sameSite: 'lax' as const, maxAge: 600, path: publicRuntimeConfig.routes.callback }
  setCookie(event, 'tco_state', state, opts)
  setCookie(event, 'tco_verifier', verifier, opts)
  setCookie(event, 'tco_redirect', redirectTo, opts)

  return sendRedirect(event, withQuery(`https://${publicRuntimeConfig.domain}/api/auth/oauth2/authorize`, {
    client_id: publicRuntimeConfig.clientId,
    redirect_uri: callbackRedirectUri(event),
    response_type: 'code',
    scope: publicRuntimeConfig.scopes.join(' '),
    state,
    code_challenge: await pkceChallenge(verifier),
    code_challenge_method: 'S256',
    ...(prompt ? { prompt } : {}),
  }))
})
```

### 1c. Bump + build + publish

- `packages/auth/package.json`: `"version": "0.0.5"` → `"0.0.6"`.
- Build: `cd packages/auth && pnpm prepack` (expect: dist rebuilt, exit 0).
- Verify: `grep -n "prompt" dist/runtime/server/routes/sign-in.get.js` shows the
  forward; `grep -n "prompt" dist/runtime/app/composables/useAuth.js` shows the
  option.
- **Publish** (manual, user): `cd packages/auth && pnpm publish`.

---

## Phase 2 — IdP: `selectAccount` config + picker page (`better-auth`)

### 2a. `server/auth.config.ts` — add `selectAccount` to `oauthProvider`

In the `oauthProvider({ ... })` block (currently `loginPage`, `consentPage`,
`storeClientSecret`, custom claims hooks), add:

```ts
      oauthProvider({
        loginPage: '/sign-in',
        consentPage: '/oauth/consent',
        // Account picker: only shown when an RP explicitly sends
        // prompt=select_account (shouldRedirect:false = never force it, so
        // normal SSO logins stay silent for every client).
        selectAccount: {
          page: '/oauth/select-account',
          shouldRedirect: async () => false,
        },
        storeClientSecret: 'hashed',
        // ...existing customIdTokenClaims / customUserInfoClaims unchanged
```

### 2b. New page `app/pages/oauth/select-account.vue`

Mirrors `app/pages/oauth/consent.vue` (the resume template). Uses Nuxt UI only.
**Hardened** per failure-mode review: (i) rebuild the authorize URL from a clean
allowlist — never round-trip the provider's `sig`/`exp`/`ba_iat`; (ii) "Use
another account" signs out *and* redrives authorize with `prompt=login` so a
flaky sign-out can never silently re-issue the same account; (iii) on any
`/continue` failure, redrive a *fresh* signed picker instead of dereferencing a
missing `url`.

```vue
<script setup lang="ts">
definePageMeta({ layout: 'auth', public: true })

const route = useRoute()
const { user } = useUserSession()
const client = useAuthClient()

const submitting = ref<'continue' | 'switch' | ''>('')
const error = ref('')

const display = computed(() => ({
  name: user.value?.name || user.value?.email || 'your account',
  email: user.value?.email ?? '',
  image: user.value?.image ?? null,
}))

// Real OAuth params only. Never forward provider-internal signed params
// (sig/exp/ba_iat) — re-signing over a stale sig yields invalid_signature.
const AUTHORIZE_PARAMS = ['client_id', 'redirect_uri', 'response_type', 'scope', 'state', 'code_challenge', 'code_challenge_method', 'nonce'] as const

function authorizeUrl(extra: Record<string, string> = {}) {
  const p = new URLSearchParams()
  for (const key of AUTHORIZE_PARAMS) {
    const v = route.query[key]
    if (typeof v === 'string' && v)
      p.set(key, v)
  }
  for (const [k, v] of Object.entries(extra))
    p.set(k, v)
  return `/api/auth/oauth2/authorize?${p.toString()}`
}

async function continueAs() {
  error.value = ''
  submitting.value = 'continue'
  try {
    const oauthQuery = globalThis.location.search.replace(/^\?/, '')
    const result = await $fetch<{ url?: string, redirect?: boolean }>('/api/auth/oauth2/continue', {
      method: 'POST',
      body: { selected: true, oauth_query: oauthQuery },
    })
    if (result?.url) {
      globalThis.location.href = result.url
      return
    }
    // No url in a 2xx response — restart with a fresh signed picker.
    globalThis.location.href = authorizeUrl({ prompt: 'select_account' })
  }
  catch {
    // Expired sig/exp or lapsed session → mint a fresh picker rather than
    // dereferencing a missing url.
    globalThis.location.href = authorizeUrl({ prompt: 'select_account' })
  }
}

async function useAnother() {
  error.value = ''
  submitting.value = 'switch'
  try {
    await client?.signOut()
    // prompt=login forces the login screen even if the cookie lingers, so a
    // flaky sign-out can never silently re-issue the same account.
    globalThis.location.href = authorizeUrl({ prompt: 'login' })
  }
  catch {
    error.value = 'Could not switch account. Please try again.'
    submitting.value = ''
  }
}
</script>

<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <div class="text-center space-y-1">
        <h1 class="text-xl font-semibold text-highlighted">
          Choose an account
        </h1>
        <p class="text-sm text-muted">
          to continue
        </p>
      </div>
    </template>

    <div class="space-y-2">
      <UAlert v-if="error" color="error" variant="soft" icon="i-lucide-circle-alert" :description="error" />

      <UButton
        block
        color="neutral"
        variant="outline"
        size="xl"
        :loading="submitting === 'continue'"
        :disabled="submitting !== ''"
        class="justify-start"
        @click="continueAs"
      >
        <template #leading>
          <UAvatar :src="display.image ?? undefined" :alt="display.name" size="sm" />
        </template>
        <span class="flex flex-col items-start">
          <span class="font-medium">{{ display.name }}</span>
          <span class="text-xs text-muted">{{ display.email }}</span>
        </span>
      </UButton>

      <UButton
        block
        color="neutral"
        variant="ghost"
        size="lg"
        icon="i-lucide-user-plus"
        :loading="submitting === 'switch'"
        :disabled="submitting !== ''"
        label="Use another account"
        @click="useAnother"
      />
    </div>
  </UCard>
</template>
```

> Note: `/oauth/select-account` is intentionally **not** `/sign-in`, so the
> global `auth.global.ts` bounce (`to.path === '/sign-in' → '/'`) does not strip
> the OAuth query. It is `public: true` and, since it is not
> `unauthenticatedOnly`, a logged-in user renders it fine.

---

## Phase 3 — zcaflare: trigger the picker after logout

### 3a. `layers/auth/app/components/Auth/AuthLoginCard.vue`

The post-logout screen's button should request the picker. Current
`handleSignIn` calls `signIn('/')`. Change to pass the prompt only in the
signed-out state:

```ts
function handleSignIn() {
  signIn('/', loggedOut.value ? { prompt: 'select_account' } : undefined)
}
```

(The `onMounted` auto-login stays `void signIn('/')` — no prompt — so normal
first-load SSO is unchanged.)

### 3b. `pnpm-workspace.yaml`

`'@thecodeorigin/auth': 0.0.5` → `0.0.6`, then `pnpm install` (updates lockfile).

---

## Phase 4 — nuxt-template (optional follow-up)

Same as 3a/3b in `D:\projects\nuxt-template`
(`layers/auth/app/components/Auth/AuthLoginCard.vue` `handleSignIn`,
`pnpm-workspace.yaml` `0.0.2`→`0.0.6`, `pnpm install`). Defer unless you want
parity now.

---

## Cross-repo file map

| Repo | File | Change |
|---|---|---|
| better-auth/packages/auth | `src/runtime/app/composables/useAuth.ts` | `signIn` prompt option |
| better-auth/packages/auth | `src/runtime/server/routes/sign-in.get.ts` | forward allowlisted `prompt` |
| better-auth/packages/auth | `package.json` | `0.0.5`→`0.0.6` + `pnpm prepack` + publish |
| better-auth | `server/auth.config.ts` | `selectAccount` block |
| better-auth | `app/pages/oauth/select-account.vue` | new picker page |
| zcaflare | `layers/auth/app/components/Auth/AuthLoginCard.vue` | pass `prompt: 'select_account'` when logged out |
| zcaflare | `pnpm-workspace.yaml` (+lock) | catalog `0.0.6` |
| nuxt-template (opt) | same two files | catalog `0.0.6` + trigger |

## Test strategy

No Vitest/Playwright runner in the IdP (per its CLAUDE.md — oracles are lint +
typecheck + proof scripts + live browser). zcaflare has Vitest/Playwright.

- **Module**: `cd packages/auth && pnpm prepack` succeeds; grep dist for the
  forwarded `prompt`.
- **IdP**: `pnpm lint` + `pnpm exec nuxi typecheck` green. Live browser walk
  (Chrome DevTools MCP): RP logout → click "Sign in" → picker renders with the
  current account → "Continue as" returns to the RP logged in as same user →
  logout again → "Use another account" → login form → sign in as a different
  user → RP now shows the other user.
- **zcaflare**: `pnpm lint` + `pnpm typecheck` green (works against 0.0.6 once
  installed; `signIn` with an options arg typechecks against the new module
  types). Existing `layers/auth/test/nuxt/user-menu` still green.

## Acceptance criteria

1. After a zcaflare logout, clicking "Sign in" on `/auth/login?loggedout=1`
   lands on the IdP **"Choose an account"** screen, not a silent re-login.
2. "Continue as {me}" returns to zcaflare authenticated as the same user (one
   click, no credentials).
3. "Use another account" clears the IdP session and shows the login form; after
   signing in as a different user, zcaflare reflects the new user.
4. Normal first-time sign-in (no prior session) is unchanged — no picker, no
   extra clicks (auto `signIn('/')` sends no prompt).
5. No redirect loop on either picker path (both strip the triggering prompt on
   re-entry — verified against provider source).
6. Idle/expired picker (>10 min) recovers by minting a fresh picker rather than
   navigating to `undefined`.
7. Other OIDC clients and normal logins are unaffected (`shouldRedirect:false`).

## Suggested cook invocation

Cook cannot publish npm or deploy. Run per-repo, respecting the deploy order:

1. `cook` Phase 2 in `D:\projects\better-auth` (IdP config + page) → deploy.
2. `cook` Phase 1 in `D:\projects\better-auth\packages\auth` → **you** `pnpm publish`.
3. `cook` Phase 3 in `D:\projects\zcaflare\zcaflare` (after 0.0.6 is live) → `pnpm install` → deploy.
4. (optional) Phase 4 in `D:\projects\nuxt-template`.
