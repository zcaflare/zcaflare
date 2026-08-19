<script setup lang="ts">
import type { ZaloProjectDetail } from '#layers/zalo/app/api/useZaloApi'
import { useZaloApi } from '#layers/zalo/app/api/useZaloApi'
import ZaloReauthenticate from './ZaloReauthenticate.vue'
import ZaloWebhookDocs from './ZaloWebhookDocs.vue'

const props = defineProps<{ project: ZaloProjectDetail }>()

const api = useZaloApi()
const toast = useToast()
const { copy, copied } = useClipboard()
const secret = ref('')
const visible = ref(false)
const loadingSecret = ref(false)
const reauthenticateOpen = ref(false)

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const connectedAt = computed(() => dateFormatter.format(new Date(props.project.connectedAt)))
const updatedAt = computed(() => props.project.updatedAt ? dateFormatter.format(new Date(props.project.updatedAt)) : '—')

function clearSecret() {
  secret.value = ''
  visible.value = false
}

async function requestSecret() {
  clearSecret()
  loadingSecret.value = true
  try {
    return (await api.revealProjectSecret(props.project.id)).secret
  }
  catch (error) {
    clearSecret()
    toast.add({ title: 'Could not reveal signing secret', description: getErrorMessage(error), color: 'error' })
    return null
  }
  finally {
    loadingSecret.value = false
  }
}

async function revealSecret() {
  const value = await requestSecret()
  if (value) {
    secret.value = value
    visible.value = true
  }
}

async function copySecret() {
  const value = await requestSecret()
  if (!value)
    return
  try {
    await copy(value)
    toast.add({ title: 'Signing secret copied', color: 'success' })
  }
  finally {
    clearSecret()
  }
}

onBeforeUnmount(clearSecret)
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 class="font-semibold text-highlighted">
              Webhook configuration
            </h2>
            <p class="mt-1 text-sm text-muted">
              Use these values to receive and verify events from this Zalo session.
            </p>
          </div>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-simple-icons-zalo"
            @click="reauthenticateOpen = true"
          >
            Re-authenticate with Zalo
          </UButton>
        </div>
      </template>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField label="Callback URL" class="sm:col-span-2">
          <UInput :model-value="project.callbackUrl" readonly class="w-full font-mono" />
        </UFormField>
        <UFormField label="Session ID">
          <UInput :model-value="project.sessionId" readonly class="w-full font-mono" />
        </UFormField>
        <UFormField label="Configured">
          <UInput :model-value="connectedAt" readonly class="w-full" />
        </UFormField>
        <UFormField label="Last updated">
          <UInput :model-value="updatedAt" readonly class="w-full" />
        </UFormField>
        <UFormField label="Webhook signing secret" description="Hidden by default. Reveal it only when configuring your receiver." class="sm:col-span-2">
          <UFieldGroup class="w-full">
            <UInput
              :model-value="secret"
              :type="visible ? 'text' : 'password'"
              readonly
              autocomplete="off"
              aria-label="Webhook signing secret"
              placeholder="Stored securely"
              class="min-w-0 flex-1 font-mono"
            />
            <UButton
              v-if="visible"
              color="neutral"
              variant="outline"
              icon="i-lucide-eye-off"
              aria-label="Hide signing secret"
              @click="clearSecret"
            >
              Hide
            </UButton>
            <UButton
              v-else
              color="neutral"
              variant="outline"
              icon="i-lucide-eye"
              :loading="loadingSecret"
              aria-label="Reveal signing secret"
              @click="revealSecret"
            >
              Reveal
            </UButton>
            <UButton
              color="neutral"
              variant="outline"
              :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
              :loading="loadingSecret"
              aria-label="Copy signing secret"
              @click="copySecret"
            >
              Copy
            </UButton>
          </UFieldGroup>
        </UFormField>
      </div>
    </UCard>

    <USeparator />
    <ZaloWebhookDocs />

    <UModal
      v-model:open="reauthenticateOpen"
      title="Re-authenticate with Zalo"
      description="Refresh the Zalo login without changing this webhook."
    >
      <template #body>
        <ZaloReauthenticate
          :callback-url="project.callbackUrl"
          :session-id="project.sessionId"
          @close="reauthenticateOpen = false"
        />
      </template>
    </UModal>
  </div>
</template>
