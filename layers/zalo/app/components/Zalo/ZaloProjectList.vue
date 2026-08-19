<script setup lang="ts">
import type { ZaloProjectDetail } from '#layers/zalo/app/api/useZaloApi'
import ZaloProjectItem from './ZaloProjectItem.vue'

defineProps<{ projects: ZaloProjectDetail[], loading?: boolean }>()
</script>

<template>
  <div>
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="index in 3" :key="index" class="h-24 rounded-lg" />
    </div>
    <div v-else-if="projects.length === 0" class="flex flex-col items-center gap-3 py-12 text-center text-muted">
      <UIcon name="i-lucide-webhook" class="size-10 opacity-40" />
      <div>
        <p class="font-medium text-default">
          No Zalo connections yet
        </p>
        <p class="mt-1 text-sm">
          Connect a Zalo account to create your first project.
        </p>
      </div>
      <UButton to="/" icon="i-lucide-qr-code">
        Connect Zalo
      </UButton>
    </div>
    <div v-else class="space-y-3">
      <ZaloProjectItem v-for="project in projects" :key="project.id" :project="project" />
    </div>
  </div>
</template>
