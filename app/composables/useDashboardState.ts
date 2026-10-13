import type { Ref } from 'vue'

/** Owns the live/frozen view state while the log source keeps receiving events. */
export function useDashboardState(logs: Ref<Log[]>) {
  const displayedLogs = shallowRef<Log[]>([])
  const isPaused = ref(false)
  const batchRefresh = ref(false)
  const alertPulse = ref(false)

  const newLogsCount = computed(() => {
    if (!isPaused.value) return 0
    const visibleIds = new Set(displayedLogs.value.map(log => log.id))
    return logs.value.filter(log => !visibleIds.has(log.id)).length
  })

  const nbAlerts = computed(() => ({
    critical: logs.value.filter(log => log.level === 'critical').length,
    error: logs.value.filter(log => log.level === 'error').length,
    warning: logs.value.filter(log => log.level === 'warning').length,
    debug: logs.value.filter(log => log.level === 'debug').length,
  }))

  function refreshVisibleLogs() {
    displayedLogs.value = logs.value
  }

  // Skip automatic updates while paused or when batch refresh controls the timing.
  watch(logs, () => {
    if (!isPaused.value && !batchRefresh.value) refreshVisibleLogs()
  }, { immediate: true })


  // Pulse the Critical alert when a new critical log arrives.
  // Ignore the initial log list so loading existing data does not trigger it.
  let pulseTimer: ReturnType<typeof setTimeout> | undefined
  watch(logs, (currentLogs, previousLogs) => {
    if (!previousLogs.length) return
    const previousIds = new Set(previousLogs.map(log => log.id))
    const newErrors = currentLogs.some(log => !previousIds.has(log.id) && (log.level === 'critical'))
    if (!newErrors) return

    alertPulse.value = true
    if (pulseTimer) clearTimeout(pulseTimer)
    pulseTimer = setTimeout(() => { alertPulse.value = false }, 900)
  })

  let refreshTimer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    refreshTimer = setInterval(() => {
      if (!isPaused.value && batchRefresh.value) refreshVisibleLogs()
    }, REFRESH_MS)
  })

  onBeforeUnmount(() => {
    if (refreshTimer) clearInterval(refreshTimer)
    if (pulseTimer) clearTimeout(pulseTimer)
  })

  function resumeDisplay() {
    isPaused.value = false
    refreshVisibleLogs()
  }

  function togglePause() {
    if (isPaused.value) resumeDisplay()
    else isPaused.value = true
  }

  return { displayedLogs, isPaused, batchRefresh, newLogsCount, nbAlerts, alertPulse, togglePause,
  }
}