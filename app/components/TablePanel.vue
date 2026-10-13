<script setup lang="ts">

defineProps<{
  panel: TablePanelConfig
  logs: Log[]
  pageSize: number
  highlighted?: boolean
}>()

const emit = defineEmits<{
  'update:title': [title: string]
  remove: []
  createFilteredPanel: [filters: TableFilters]
}>()

</script>

<template>
  <UCard class="min-w-0 overflow-hidden rounded-lg ring-1 ring-default/70 shadow-sm" :class="{ 'panel-highlight-once': highlighted }" :ui="{ body: 'p-0 sm:p-0' }">
    <header class="flex flex-wrap items-center justify-between gap-2 border-b border-default bg-elevated/30 px-3 py-2">
      <div class="flex min-w-0 items-center gap-2">
        <span class="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><UIcon name="i-lucide-table-2" class="size-4" /></span>
        <div class="min-w-0">
          <UInput
            :model-value="panel.title"
            :aria-label="`Table name: ${panel.title}`"
            placeholder="Table name"
            variant="none"
            size="sm"
            class="max-w-sm text-sm font-semibold"
            @update:model-value="emit('update:title', $event)"
          />
        </div>
      </div>
      <UButton class="cursor-pointer" color="neutral" variant="ghost" size="xs" icon="i-lucide-trash-2" :aria-label="`Delete ${panel.title}`" @click="emit('remove')" />
    </header>
    <Table
      :logs="logs"
      :page-size="pageSize"
      :initial-filters="panel.filters"
      @create-filtered-panel="emit('createFilteredPanel', $event)"
    />
  </UCard>
</template>