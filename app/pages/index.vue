<script setup lang="ts">
import ZaloWebhookDocs from '#layers/zalo/app/components/Zalo/ZaloWebhookDocs.vue'
import ZaloWebhookWizard from '#layers/zalo/app/components/Zalo/ZaloWebhookWizard.vue'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

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
