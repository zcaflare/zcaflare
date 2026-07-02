# Phase 04 — Frontend: wizard, docs, detail page, homepage

Client API wrapper, the polling composable, the two components, the webhook
detail page, the sidebar contribution, and the homepage rewrite. Nuxt UI only;
semantic colors; explicit component imports (`components: false`).

## Step 1 — Client API

### `layers/zalo/app/api/useZaloApi.ts`
```ts
export interface ZaloStatusResult {
  phase: 'pending' | 'authenticated' | 'expired'
  projectId?: string
}

export interface ZaloWebhookDetail {
  projectId: string
  callbackUrl: string
  sessionId: string
  webhookSecret: string
  createdAt: string
}

export function useZaloApi() {
  function startLogin(callbackUrl: string) {
    return $http<{ sessionId: string, qrDataUrl: string, status: string }>('/api/zalo/login', {
      method: 'POST',
      body: { callbackUrl },
    })
  }

  function fetchStatus(sessionId: string) {
    // silent: no global loading bar while polling
    return $http<ZaloStatusResult>(`/api/zalo/${sessionId}/status`, { silent: true })
  }

  function fetchWebhook(projectId: string) {
    return $http<ZaloWebhookDetail>(`/api/zalo/webhooks/${projectId}`)
  }

  return { startLogin, fetchStatus, fetchWebhook }
}
```

## Step 2 — Wizard composable (polling lifecycle)

### `layers/zalo/app/composables/useZaloWizard.ts`
```ts
type Phase = 'callback' | 'scanning' | 'done' | 'error'

const POLL_INTERVAL_MS = 2500
const MAX_ATTEMPTS = 120 // ~5 min, aligned under the 30-min KV TTL

export function useZaloWizard() {
  const api = useZaloApi()

  const phase = ref<Phase>('callback')
  const callbackUrl = ref('')
  const qrDataUrl = ref('')
  const sessionId = ref('')
  const projectId = ref('')
  const webhookSecret = ref('')
  const errorMessage = ref('')
  const starting = ref(false)

  let active = false
  let attempts = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  function stop() {
    active = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  async function start() {
    if (starting.value)
      return
    starting.value = true
    errorMessage.value = ''
    try {
      const res = await api.startLogin(callbackUrl.value)
      sessionId.value = res.sessionId
      qrDataUrl.value = res.qrDataUrl
      phase.value = 'scanning'
      active = true
      attempts = 0
      timer = setTimeout(poll, POLL_INTERVAL_MS)
    }
    catch (err) {
      errorMessage.value = getErrorMessage(err)
      phase.value = 'error'
    }
    finally {
      starting.value = false
    }
  }

  // Serialized: each poll fully resolves before the next is scheduled, so the
  // server never sees overlapping polls for one session (race guard).
  async function poll() {
    if (!active)
      return
    attempts++
    try {
      const res = await api.fetchStatus(sessionId.value)
      if (!active)
        return
      if (res.phase === 'authenticated' && res.projectId) {
        stop()
        projectId.value = res.projectId
        const wh = await api.fetchWebhook(res.projectId)
        webhookSecret.value = wh.webhookSecret
        phase.value = 'done'
        return
      }
      if (res.phase === 'expired') {
        stop()
        errorMessage.value = 'This Zalo login expired. Please start again.'
        phase.value = 'error'
        return
      }
    }
    catch {
      // transient — keep polling
    }
    if (attempts >= MAX_ATTEMPTS) {
      stop()
      errorMessage.value = 'Timed out waiting for the Zalo scan. Please try again.'
      phase.value = 'error'
      return
    }
    if (active)
      timer = setTimeout(poll, POLL_INTERVAL_MS)
  }

  function reset() {
    stop()
    phase.value = 'callback'
    qrDataUrl.value = ''
    sessionId.value = ''
    projectId.value = ''
    webhookSecret.value = ''
    errorMessage.value = ''
  }

  onScopeDispose(stop)

  return { phase, callbackUrl, qrDataUrl, projectId, webhookSecret, errorMessage, starting, start, reset }
}
```

## Step 3 — Docs component (reused on homepage + detail page)

### `layers/zalo/app/components/Zalo/ZaloWebhookDocs.vue`
```vue
<script setup lang="ts">
const props = withDefaults(defineProps<{ secret?: string }>(), { secret: '' })

const secretValue = computed(() => props.secret || '<YOUR_WEBHOOK_SECRET>')

const verifySnippet = computed(() => `import { createHmac, timingSafeEqual } from 'node:crypto'

const WEBHOOK_SECRET = '${secretValue.value}'

// Verify every request before trusting its payload.
function verify(rawBody, headers) {
  const expected = 'sha256=' + createHmac('sha256', WEBHOOK_SECRET)
    .update(\`\${headers['x-zalo-timestamp']}.\${rawBody}\`)
    .digest('hex')
  const a = Buffer.from(headers['x-zalo-signature'] || '')
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}`)

const { copy, copied } = useClipboard({ source: verifySnippet })

const steps = [
  { icon: 'i-lucide-link', title: 'Add your callback URL', text: 'Tell us the public https URL on your server that should receive Zalo events.' },
  { icon: 'i-lucide-qr-code', title: 'Sign in with Zalo', text: 'Scan the QR code with the Zalo app. We never see your Zalo password.' },
  { icon: 'i-lucide-webhook', title: 'Receive signed events', text: 'Messages, reactions, undos and group events are POSTed to your callback URL — each signed so you can trust it.' },
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-highlighted">
        How it works
      </h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-3">
        <UCard v-for="step in steps" :key="step.title" variant="subtle">
          <div class="flex items-start gap-3">
            <UIcon :name="step.icon" class="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p class="font-medium text-highlighted">
                {{ step.title }}
              </p>
              <p class="text-sm text-muted mt-1">
                {{ step.text }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <div>
      <h3 class="font-semibold text-highlighted">
        Secure your webhook
      </h3>
      <p class="text-sm text-muted mt-1">
        Every event is POSTed with two headers: <code>x-zalo-timestamp</code>
        and <code>x-zalo-signature</code>
        (<code>sha256=HMAC_SHA256(secret, "{timestamp}.{rawBody}")</code>).
        Verify the signature with your signing secret before trusting any
        payload:
      </p>

      <div class="relative mt-3">
        <UButton
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          color="neutral"
          variant="ghost"
          size="xs"
          class="absolute top-2 right-2"
          :aria-label="copied ? 'Copied' : 'Copy code'"
          @click="copy()"
        />
        <pre class="overflow-x-auto rounded-lg border border-muted bg-elevated p-4 text-xs text-default"><code>{{ verifySnippet }}</code></pre>
      </div>

      <p v-if="!secret" class="text-xs text-muted mt-2">
        Your real signing secret appears here once you finish signing in with Zalo.
      </p>
    </div>
  </div>
</template>
```

## Step 4 — Wizard component

### `layers/zalo/app/components/Zalo/ZaloWebhookWizard.vue`
```vue
<script setup lang="ts">
import { useZaloWizard } from '#layers/zalo/app/composables/useZaloWizard'

const w = useZaloWizard()
const toast = useToast()
const { copy: copySecret, copied: secretCopied } = useClipboard()

function copy() {
  copySecret(w.webhookSecret.value)
  toast.add({ title: 'Signing secret copied', color: 'success' })
}
</script>

<template>
  <UCard>
    <template #header>
      <div>
        <h1 class="text-xl font-semibold text-highlighted">
          Create a new Zalo Webhook
        </h1>
        <p class="text-sm text-muted mt-1">
          Forward every Zalo event to your own server — signed and ready to trust.
        </p>
      </div>
    </template>

    <!-- Step 1: callback URL -->
    <div v-if="w.phase.value === 'callback'" class="space-y-4">
      <UFormField label="Step 1 — Your callback URL" name="callbackUrl">
        <UInput
          v-model="w.callbackUrl.value"
          type="url"
          placeholder="https://example.com/zalo/webhook"
          icon="i-lucide-link"
          class="w-full"
          :disabled="w.starting.value"
          @keydown.enter="w.start()"
        />
      </UFormField>

      <div>
        <p class="text-sm text-muted mb-2">
          Step 2 — Sign in with Zalo
        </p>
        <UButton
          icon="i-simple-icons-zalo"
          size="lg"
          :loading="w.starting.value"
          :disabled="!w.callbackUrl.value"
          @click="w.start()"
        >
          Sign in with Zalo
        </UButton>
      </div>
    </div>

    <!-- Step 2: scan QR -->
    <div v-else-if="w.phase.value === 'scanning'" class="flex flex-col items-center gap-4 py-2">
      <p class="text-sm text-muted">
        Open <span class="font-medium text-highlighted">Zalo</span> → Scan QR, then point your camera here.
      </p>
      <img
        v-if="w.qrDataUrl.value"
        :src="w.qrDataUrl.value"
        alt="Zalo login QR code"
        class="size-56 rounded-lg border border-muted bg-white p-2"
      >
      <div class="flex items-center gap-2 text-sm text-muted">
        <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
        Waiting for you to scan…
      </div>
      <UButton color="neutral" variant="ghost" size="sm" @click="w.reset()">
        Cancel
      </UButton>
    </div>

    <!-- Step 3: done -->
    <div v-else-if="w.phase.value === 'done'" class="space-y-4">
      <UAlert
        icon="i-lucide-check-circle"
        color="success"
        variant="subtle"
        title="Your Zalo webhook is live!"
        description="Zalo events will now be POSTed to your callback URL."
      />

      <UFormField label="Webhook signing secret" help="Copy it now and add it to your server. You can view it again on the webhook page.">
        <UInput
          :model-value="w.webhookSecret.value"
          readonly
          class="w-full font-mono"
          :type="'text'"
        >
          <template #trailing>
            <UButton
              :icon="secretCopied ? 'i-lucide-check' : 'i-lucide-copy'"
              color="neutral"
              variant="link"
              size="xs"
              aria-label="Copy secret"
              @click="copy()"
            />
          </template>
        </UInput>
      </UFormField>

      <div class="flex gap-2">
        <UButton :to="`/webhooks/${w.projectId.value}`" icon="i-lucide-arrow-right" trailing>
          Open webhook
        </UButton>
        <UButton color="neutral" variant="ghost" @click="w.reset()">
          Create another
        </UButton>
      </div>
    </div>

    <!-- Error -->
    <div v-else class="space-y-4">
      <UAlert
        icon="i-lucide-alert-triangle"
        color="error"
        variant="subtle"
        title="Something went wrong"
        :description="w.errorMessage.value"
      />
      <UButton icon="i-lucide-rotate-ccw" @click="w.reset()">
        Try again
      </UButton>
    </div>
  </UCard>
</template>
```

> Icon note: `i-simple-icons-zalo` ships with `@iconify-json/simple-icons`
> (already a dep). If it's missing in that set, fall back to
> `i-lucide-qr-code`.

## Step 5 — Webhook detail page

### `layers/zalo/app/pages/webhooks/[id].vue`
```vue
<script setup lang="ts">
import type { ZaloWebhookDetail } from '#layers/zalo/app/api/useZaloApi'
import ZaloWebhookDocs from '#layers/zalo/app/components/Zalo/ZaloWebhookDocs.vue'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'
import { useZaloApi } from '#layers/zalo/app/api/useZaloApi'

const route = useRoute()
const api = useZaloApi()
const toast = useToast()
const id = route.params.id as string

const { data: webhook, error } = useAsyncData<ZaloWebhookDetail | null>(
  `zalo-webhook-${id}`,
  () => api.fetchWebhook(id),
  { default: () => null },
)
whenError(error)

useHead({ title: 'Zalo Webhook' })

const { copy, copied } = useClipboard()
function copySecret() {
  if (webhook.value) {
    copy(webhook.value.webhookSecret)
    toast.add({ title: 'Signing secret copied', color: 'success' })
  }
}
</script>

<template>
  <UDashboardPanel id="zalo-webhook-detail">
    <template #header>
      <DashboardNavbar title="Zalo Webhook">
        <template #leading>
          <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/" />
        </template>
      </DashboardNavbar>
    </template>

    <template #body>
      <div v-if="webhook" class="max-w-3xl mx-auto w-full space-y-6 p-4">
        <UFormField label="Callback URL">
          <UInput :model-value="webhook.callbackUrl" readonly class="w-full" />
        </UFormField>

        <UFormField label="Webhook signing secret">
          <UInput :model-value="webhook.webhookSecret" readonly type="text" class="w-full font-mono">
            <template #trailing>
              <UButton
                :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
                color="neutral"
                variant="link"
                size="xs"
                aria-label="Copy secret"
                @click="copySecret()"
              />
            </template>
          </UInput>
        </UFormField>

        <USeparator />

        <ZaloWebhookDocs :secret="webhook.webhookSecret" />
      </div>
    </template>
  </UDashboardPanel>
</template>
```

## Step 6 — Sidebar contribution

### `layers/zalo/app/plugins/99.contribute.zalo.client.ts`
```ts
export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [
      { id: 'home', label: 'Home', icon: 'i-lucide-house', to: '/', section: 'main', priority: 0 },
    ],
  })
})
```

## Step 7 — Homepage rewrite

### `app/pages/index.vue` (replace entire file)
```vue
<script setup lang="ts">
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'
import ZaloWebhookDocs from '#layers/zalo/app/components/Zalo/ZaloWebhookDocs.vue'
import ZaloWebhookWizard from '#layers/zalo/app/components/Zalo/ZaloWebhookWizard.vue'

useHead({ title: 'Create a Zalo Webhook' })
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <DashboardNavbar title="Home" />
    </template>

    <template #body>
      <div class="max-w-3xl mx-auto w-full space-y-8 p-4">
        <ZaloWebhookWizard />
        <ZaloWebhookDocs />
      </div>
    </template>
  </UDashboardPanel>
</template>
```
> The old redirect-to-`/dashboard` middleware is removed. The page requires
> auth by default, so unauthenticated visitors are redirected to sign-in by the
> global auth middleware (matches the "require ZcaFlare sign-in" decision).

## Done when

- Visiting `/` while signed in shows the wizard + docs in the dashboard shell;
  signed-out users land on `/auth/login`.
- The callback input + "Sign in with Zalo" drive the QR/poll flow; success
  shows the secret with copy and an "Open webhook" link to `/webhooks/:id`.
- `/webhooks/:id` shows callback URL, secret (re-revealed), and verification
  docs; a non-member gets the `whenError` 403 path.
- `pnpm typecheck` + `pnpm lint` pass.
