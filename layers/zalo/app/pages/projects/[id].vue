<script setup lang="ts">
import { useZaloApi } from '#layers/zalo/app/api/useZaloApi'
import ZaloProjectIntegration from '#layers/zalo/app/components/Zalo/ZaloProjectIntegration.vue'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

const route = useRoute()
const api = useZaloApi()
const id = route.params.id as string
const { data: project, status, error } = useAsyncData(`zalo-project-${id}`, () => api.fetchProject(id))
whenError(error)
useHead(() => ({ title: project.value?.name ?? 'Project' }))
</script>

<template>
  <UDashboardPanel id="project-detail">
    <template #header>
      <DashboardNavbar :title="project?.name ?? 'Project'">
        <template #leading>
          <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/projects" />
        </template>
        <template #right>
          <UBadge v-if="project" color="neutral" variant="subtle">
            Configured
          </UBadge>
        </template>
      </DashboardNavbar>
    </template>
    <template #body>
      <div v-if="project" class="mx-auto w-full max-w-4xl space-y-6 p-4">
        <p v-if="project.description" class="text-muted">
          {{ project.description }}
        </p>
        <ZaloProjectIntegration :project="project" />
      </div>
      <div v-else-if="status === 'pending'" class="mx-auto w-full max-w-4xl p-4">
        <USkeleton class="h-96 w-full" />
      </div>
      <div v-else class="mx-auto w-full max-w-4xl p-4">
        <UAlert color="error" icon="i-lucide-circle-alert" title="Project unavailable" description="This project does not exist or you no longer have access." />
      </div>
    </template>
  </UDashboardPanel>
</template>
