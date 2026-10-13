<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/vue-table'

const props = withDefaults(defineProps<{
  logs: Log[]
  initialFilters?: TableFilters
  pageSize: number
}>(), { initialFilters: () => ({}) })

const emit = defineEmits<{
  createFilteredPanel: [filters: TableFilters]
}>()

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const expanded = ref<Record<string, boolean>>({})
const pagination = ref({ pageIndex: 0, pageSize: props.pageSize })
const logTable = useTemplateRef('logTable')
const {
  search,
  selectedLevel,
  selectedService,
  selectedUserId,
  levels,
  services,
  filteredLogs,
  visibleLogs,
  resetFilters,
} = useTableFilters(toRef(props, 'logs'), toRef(props, 'initialFilters'))

// Reset to page one when the active filters change.
watch([search, selectedLevel, selectedService, selectedUserId], () => {
  pagination.value.pageIndex = 0
})

// When the dashboard changes layout (grid 1 to 2 columns for ex), update the row count and return to the first page.
watch(() => props.pageSize, (pageSize) => {
  pagination.value = { pageIndex: 0, pageSize }
})

// Keep the row-style callback typed against our log model instead of Vue's template inference.
const tableMeta = {
  class: {
    tr: (row: { original: Log }) => LEVEL_CONFIG[row.original.level].rowClass,
  },
}

function openFor(filters: TableFilters) {
  emit('createFilteredPanel', filters)
}

const columns: TableColumn<Log>[] = [
  {
    id: 'expand',
    cell: ({ row }) => h(UButton, {
      class: 'cursor-pointer', color: 'neutral', variant: 'ghost', icon: 'i-lucide-chevron-down', square: true,
      'aria-label': 'View details',
      ui: { leadingIcon: ['transition-transform', row.getIsExpanded() ? 'duration-200 rotate-180' : ''] },
      onClick: () => row.toggleExpanded(),
    }),
  },
  { accessorKey: 'timestamp', header: 'Time', cell: ({ row }) => formatTime(row.original.timestamp) },
  {
    accessorKey: 'level',
    header: 'Level',
    cell: ({ row }) => {
      const level = row.original.level
      const { label, color } = LEVEL_CONFIG[level]

      return h(UButton, {
        class: 'cursor-pointer',
        color: 'neutral',
        variant: 'link',
        size: 'xs',
        onClick: () => openFor({ level }),
      }, () => h(UBadge, {
        color,
        variant: level === 'critical' ? 'solid' : 'subtle',
      }, () => label))
    },
  },
  { accessorKey: 'message', header: 'Message' },
  {
    accessorKey: 'service', header: 'Service',
    cell: ({ row }) => h(UButton, {
      class: 'cursor-pointer', color: 'neutral', variant: 'outline', size: 'xs',
      onClick: () => openFor({ service: row.original.service }),
    }, () => row.original.service),
  },
  {
    id: 'user', accessorFn: row => row.metadata.user_id, header: 'User',
    cell: ({ row }) => h(UButton, {
      class: 'cursor-pointer', color: 'neutral', variant: 'link', size: 'xs',
      onClick: () => openFor({ userId: String(row.original.metadata.user_id) }),
    }, () => String(row.original.metadata.user_id)),
  },
]
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 border-b border-accented px-3 py-2">
    <UInput v-model="search" size="xs" class="w-32 min-w-0" placeholder="Filter…" />
    <USelect v-model="selectedLevel" :items="levels" value-key="value" label-key="label" size="xs" class="w-28 min-w-0" />
    <USelect v-model="selectedService" :items="services" value-key="value" label-key="label" size="xs" class="w-28 min-w-0" />
    <UInput v-model="selectedUserId" size="xs" placeholder="User ID" class="w-24 min-w-0" />
    <UButton class="cursor-pointer" color="neutral" variant="outline" size="xs" icon="i-lucide-rotate-ccw" aria-label="Reset filters" title="Reset filters" @click="resetFilters" />
  </div>

  <div class="overflow-x-auto">
    <UTable
      ref="logTable"
      v-model:pagination="pagination"
      v-model:expanded="expanded"
      :data="visibleLogs"
      :columns="columns"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false,
      }"
      :get-row-id="(row: Log) => row.id"
      :meta="tableMeta"
      :ui="{ tr: 'data-[expanded=true]:bg-elevated/50', th: 'px-2 py-1.5 text-xs', td: 'px-2 py-1 text-xs' }"
      class="flex-1"
    >
      <template #expanded="{ row }">
        <div class="space-y-3 p-4 text-sm">
          <dl class="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
            <dt class="font-medium">Date and time</dt>
              <dd>{{ formatDateTime(row.original.timestamp) }}</dd>
            <dt class="font-medium">User</dt>
              <dd><UButton variant="link" size="xs" @click="openFor({ userId: String(row.original.metadata.user_id) })">{{ row.original.metadata.user_id }}</UButton></dd>
            <dt class="font-medium">Request ID</dt>
              <dd>{{ row.original.metadata.request_id }}</dd>
            <dt class="font-medium">HTTP status</dt><dd>{{ row.original.metadata.http_status }}</dd>
            <dt class="font-medium">Duration</dt><dd>{{ formatDuration(row.original.duration_ms) }}</dd>
          </dl>
          <details>
            <summary class="cursor-pointer">Full JSON</summary>
            <pre class="mt-2 overflow-x-auto">{{ JSON.stringify(row.original, null, 2) }}</pre>
          </details>
        </div>
      </template>
    </UTable>
    <p v-if="filteredLogs.length === 0" class="px-4 py-8 text-center text-muted">
      No logs match these filters.
    </p>
  </div>

  <div class="flex justify-end border-t border-default px-3 py-2">
    <UPagination
      v-if="visibleLogs.length > pagination.pageSize"
      :page="(logTable?.tableApi?.getState().pagination.pageIndex || 0) + 1"
      :items-per-page="logTable?.tableApi?.getState().pagination.pageSize"
      :total="visibleLogs.length"
      @update:page="(page) => logTable?.tableApi?.setPageIndex(page - 1)"
    />
  </div>

</template>