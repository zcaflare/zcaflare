<script setup lang="ts">
import { useZaloWizard } from '#layers/zalo/app/composables/useZaloWizard'

const props = defineProps<{ callbackUrl: string, sessionId: string }>()
const emit = defineEmits<{ close: [] }>()
const wizard = useZaloWizard({ callbackUrl: props.callbackUrl, preserveSessionId: props.sessionId })
</script>

<template>
  <div class="space-y-4">
    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-shield-check"
      title="Your webhook configuration will stay the same"
      description="This refreshes only the Zalo login credentials. The callback URL, session ID, signing secret, and project will not change."
    />

    <div v-if="wizard.phase.value === 'callback'" class="space-y-4">
      <UFormField label="Callback URL">
        <UInput :model-value="callbackUrl" readonly class="w-full font-mono" />
      </UFormField>
      <UButton icon="i-simple-icons-zalo" size="lg" :loading="wizard.starting.value" @click="wizard.start()">
        Continue with Zalo
      </UButton>
    </div>

    <div v-else-if="wizard.phase.value === 'scanning'" class="flex flex-col items-center gap-4 py-2">
      <p class="text-sm text-muted">
        Scan this QR code with the same Zalo account currently connected to this project.
      </p>
      <img
        v-if="wizard.qrDataUrl.value"
        :src="wizard.qrDataUrl.value"
        alt="Zalo re-authentication QR code"
        class="size-56 rounded-lg border border-muted bg-white p-2"
      >
      <div class="flex items-center gap-2 text-sm text-muted">
        <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
        Waiting for you to scan…
      </div>
      <UButton color="neutral" variant="ghost" @click="wizard.reset()">
        Cancel
      </UButton>
    </div>

    <div v-else-if="wizard.phase.value === 'done'" class="space-y-4">
      <UAlert
        color="success"
        variant="subtle"
        icon="i-lucide-check-circle"
        title="Zalo re-authenticated"
        description="The existing webhook is back online with its original callback URL and signing secret."
      />
      <UButton icon="i-lucide-check" @click="emit('close')">
        Done
      </UButton>
    </div>

    <div v-else-if="wizard.phase.value === 'conflict'" class="space-y-4">
      <UAlert
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="Different Zalo account scanned"
        description="That account does not match this project. No webhook configuration was changed. Scan again with the account already connected to this project."
      />
      <UButton icon="i-lucide-rotate-ccw" @click="wizard.reset()">
        Try again
      </UButton>
    </div>

    <div v-else class="space-y-4">
      <UAlert
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="Re-authentication failed"
        :description="wizard.errorMessage.value"
      />
      <UButton icon="i-lucide-rotate-ccw" @click="wizard.reset()">
        Try again
      </UButton>
    </div>
  </div>
</template>
