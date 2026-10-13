<script setup lang="ts">
defineProps<{
  criticalCount: number
  errorCount: number
  warningCount: number
  debugCount: number
  pulse: boolean
}>()
const emit = defineEmits<{ select: [level: Log['level']] }>()
</script>

<template>
  <section class="grid grid-cols-2 gap-2 xl:grid-cols-4" aria-label="Recent alerts">
    <UButton
      class="cursor-pointer group flex items-center justify-between gap-2 rounded-lg border border-error/30 bg-error/5 p-2.5 text-left transition hover:border-error/60 hover:bg-error/10 sm:p-3"
      :class="{ 'animate-pulse ring-2 ring-error': pulse }"
      aria-label="Open critical logs"
      @click="emit('select', 'critical')"
    >
      <span class="flex min-w-0 items-center gap-2">
        <span class="grid size-8 shrink-0 place-items-center rounded-md bg-error/10 text-error"><UIcon name="i-lucide-octagon-alert" class="size-4" /></span>
        <span class="min-w-0"><span class="block text-sm font-semibold text-highlighted">Critical</span></span>
      </span>
      <span class="text-2xl font-bold tabular-nums text-error sm:text-3xl">{{ criticalCount }}</span>
    </UButton>

    <UButton
      class="cursor-pointer group flex items-center justify-between gap-2 rounded-lg border border-error/30 bg-error/5 p-2.5 text-left transition hover:border-error/60 hover:bg-error/10 sm:p-3"
      aria-label="Open error logs"
      @click="emit('select', 'error')"
    >
      <span class="flex min-w-0 items-center gap-2">
        <span class="grid size-8 shrink-0 place-items-center rounded-md bg-error/10 text-error"><UIcon name="i-lucide-circle-alert" class="size-4" /></span>
        <span class="min-w-0"><span class="block text-sm font-semibold text-highlighted">Errors</span></span>
      </span>
      <span class="text-2xl font-bold tabular-nums text-error sm:text-3xl">{{ errorCount }}</span>
    </UButton>

    <UButton
      class="cursor-pointer group flex items-center justify-between gap-2 rounded-lg border border-warning/30 bg-warning/5 p-2.5 text-left transition hover:border-warning/60 hover:bg-warning/10 sm:p-3"
      aria-label="Open warning logs"
      @click="emit('select', 'warning')"
    >
      <span class="flex min-w-0 items-center gap-2">
        <span class="grid size-8 shrink-0 place-items-center rounded-md bg-warning/10 text-warning"><UIcon name="i-lucide-triangle-alert" class="size-4" /></span>
        <span class="min-w-0"><span class="block text-sm font-semibold text-highlighted">Warnings</span></span>
      </span>
      <span class="text-2xl font-bold tabular-nums text-warning sm:text-3xl">{{ warningCount }}</span>
    </UButton>

    <UButton
      class="cursor-pointer group flex items-center justify-between gap-2 rounded-lg border border-default bg-elevated/30 p-2.5 text-left transition hover:border-default hover:bg-elevated/60 sm:p-3"
      aria-label="Open debug logs"
      @click="emit('select', 'debug')"
    >
      <span class="flex min-w-0 items-center gap-2">
        <span class="grid size-8 shrink-0 place-items-center rounded-md bg-neutral/10 text-muted"><UIcon name="i-lucide-bug" class="size-4" /></span>
        <span class="min-w-0"><span class="block text-sm font-semibold text-highlighted">Debug</span></span>
      </span>
      <span class="text-2xl font-bold tabular-nums text-muted sm:text-3xl">{{ debugCount }}</span>
    </UButton>
  </section>
</template>
