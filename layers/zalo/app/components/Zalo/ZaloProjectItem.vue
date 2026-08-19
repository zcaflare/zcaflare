<script setup lang="ts">
import type { ZaloProjectDetail } from '#layers/zalo/app/api/useZaloApi'

const props = defineProps<{ project: ZaloProjectDetail }>()
const connectedAt = computed(() => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(props.project.connectedAt)))
</script>

<template>
  <NuxtLink :to="`/projects/${project.id}`" class="block rounded-lg border border-default bg-elevated p-4 transition hover:bg-accented">
    <div class="flex items-center justify-between gap-3">
      <span class="truncate font-medium text-highlighted">{{ project.name }}</span>
      <UBadge color="neutral" variant="subtle" size="xs">
        Configured
      </UBadge>
    </div>
    <p class="mt-1 truncate text-sm text-muted">
      {{ project.callbackUrl }}
    </p>
    <p class="mt-2 text-xs text-dimmed">
      Added {{ connectedAt }}
    </p>
  </NuxtLink>
</template>
