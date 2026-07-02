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
          type="text"
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
