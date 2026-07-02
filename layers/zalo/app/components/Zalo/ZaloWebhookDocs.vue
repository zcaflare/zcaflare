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
