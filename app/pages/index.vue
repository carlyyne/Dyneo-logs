<script setup lang="ts">

// Both sources expose the same state and controls, so the dashboard stays independent of its data source.
const logSource = USE_SAMPLE_LOGS ? useSampleData() : useEventStream(LOG_STREAM_BASE_URL)
const { logs, status, failed, invalidCount, retry, close } = logSource
const { displayedLogs, isPaused, batchRefresh, newLogsCount, nbAlerts, alertPulse, togglePause } = useDashboardState(logs)
const { panels, highlightedPanelId, addPanel, addFilteredPanel, renamePanel, removePanel } = useTablePanels()

const connectionManuallyClosed = ref(false) // This state changes only after an explicit user action, not during automatic retries.
const rowsPerTable = computed(() => panels.value.length < COMPACT_TABLES_FROM_COUNT
  ? TABLE_PAGE_SIZE.standard
  : TABLE_PAGE_SIZE.compact)

const connectionState = computed<ConnectionState>(() => {
  // EventSource can report CLOSED between automatic retries. Only the user's
  // explicit close action should expose the terminal "Connection closed" state.
  if (connectionManuallyClosed.value) return 'disconnected'
  if (failed.value) return 'failed'
  if (status.value === 'OPEN') return 'connected'
  if (status.value === 'CONNECTING' && logs.value.length === 0) return 'connecting'
  return 'retrying'
})

function closeConnection() {
  connectionManuallyClosed.value = true
  failed.value = false // A manual close after retries stopped should show as disconnected, not failed.
  close()
}

function reconnect() {
  connectionManuallyClosed.value = false
  retry()
}

function openAlertTable(level: Log['level']) {
  addFilteredPanel({ level })
}
</script>

<template>
  <UDashboardGroup>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar>
          <template #title>
              <h1 class="text-xl font-bold text-blue-700">Logs Tracking</h1>
          </template>
          <template #right>
            <DashboardStatus
              :state="connectionState"
              :log-count="logs.length"
              :invalid-count="invalidCount"
              :sample="USE_SAMPLE_LOGS"
            />
            <LegendModal />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <main class="mx-auto w-full space-y-4 px-3 py-4 sm:px-4">
          <AlertSummary
            :critical-count="nbAlerts.critical"
            :error-count="nbAlerts.error"
            :warning-count="nbAlerts.warning"
            :debug-count="nbAlerts.debug"
            :pulse="alertPulse"
            @select="openAlertTable"
          />

          <DashboardControls
            :paused="isPaused"
            :new-logs-count="newLogsCount"
            :batch-refresh="batchRefresh"
            :manually-closed="connectionManuallyClosed"
            :sample="USE_SAMPLE_LOGS"
            @toggle-pause="togglePause"
            @update:batch-refresh="batchRefresh = $event"
            @add-table="addPanel"
            @close-connection="closeConnection"
            @reconnect="reconnect"
          />

          <section class="space-y-4" aria-label="Log tables">
            <div
              v-if="panels.length"
              class="grid grid-cols-1 gap-3"
              :class="panels.length > 1 ? 'xl:grid-cols-2' : 'xl:grid-cols-1'"
            >
              <TablePanel
                v-for="panel in panels"
                :key="panel.id"
                :panel="panel"
                :logs="displayedLogs"
                :page-size="rowsPerTable"
                :highlighted="highlightedPanelId === panel.id"
                @update:title="renamePanel(panel.id, $event)"
                @remove="removePanel(panel.id)"
                @create-filtered-panel="addFilteredPanel"
              />
            </div>

            <div v-if="panels.length === 0" class="rounded-xl border border-dashed border-default px-6 py-14 text-center">
              <UIcon name="i-lucide-table-2" class="mx-auto size-8 text-dimmed" />
              <h3 class="mt-3 font-semibold text-highlighted">No log tables yet</h3>
              <p class="mt-1 text-sm text-muted">Add a table to start exploring the live log stream.</p>
              <AddTableButton class="mt-4" @add="addPanel" />
            </div>
          </section>
        </main>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
