<script setup lang="ts">
import type { ZaloWebhookDetail } from '#layers/zalo/app/api/useZaloApi'
import { useZaloApi } from '#layers/zalo/app/api/useZaloApi'
import ZaloWebhookDocs from '#layers/zalo/app/components/Zalo/ZaloWebhookDocs.vue'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

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
      <div v-if="!webhook && error" class="max-w-3xl mx-auto w-full p-4">
        <div class="flex flex-col items-center gap-4 rounded-lg border border-muted bg-elevated/50 px-6 py-16 text-center">
          <UIcon name="i-lucide-lock" class="size-10 text-dimmed" />
          <div class="space-y-1">
            <p class="text-lg font-semibold text-default">
              You don't have access to this webhook
            </p>
            <p class="text-sm text-muted">
              It belongs to a different account. Sign in with the account that created it,
              or create a new webhook from the homepage.
            </p>
          </div>
          <UButton to="/" color="neutral" variant="solid" icon="i-lucide-arrow-left">
            Back to home
          </UButton>
        </div>
      </div>

      <div v-else-if="webhook" class="max-w-3xl mx-auto w-full space-y-6 p-4">
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
