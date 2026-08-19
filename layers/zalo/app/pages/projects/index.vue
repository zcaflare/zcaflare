<script setup lang="ts">
import { useZaloApi } from '#layers/zalo/app/api/useZaloApi'
import ZaloProjectList from '#layers/zalo/app/components/Zalo/ZaloProjectList.vue'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

useHead({ title: 'Projects' })
const api = useZaloApi()
const { data: projects, status, error } = useAsyncData('zalo-projects', () => api.listProjects(), { default: () => [] })
whenError(error)
</script>

<template>
  <UDashboardPanel id="projects">
    <template #header>
      <DashboardNavbar title="Projects">
        <template #right>
          <UButton to="/" icon="i-lucide-qr-code">
            Connect Zalo
          </UButton>
        </template>
      </DashboardNavbar>
    </template>
    <template #body>
      <div class="p-4">
        <ZaloProjectList :projects="projects" :loading="status === 'pending'" />
      </div>
    </template>
  </UDashboardPanel>
</template>
