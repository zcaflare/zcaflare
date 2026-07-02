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
