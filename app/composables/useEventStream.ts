import { useEventSource } from '@vueuse/core'

export function useEventStream(baseUrl: string) {
  // Newest first, with a bounded in-memory window for predictable rendering cost.
  const logs = shallowRef<Log[]>([])
  const invalidCount = ref(0)
  const failed = ref(false)
  
  const seen = new Set<string>() // The stream may replay its tail after reconnecting, so ignore IDs we already handled.

  const { status, data, open, close } = useEventSource(
    `${baseUrl}/logs/stream?tail=${LOG_STREAM_TAIL}`,
    [],
    {
      autoReconnect: {
        retries: 10,
        delay: 3000,
        onFailed() {
          failed.value = true
        },
      },
    },
  )

  function addLog(raw: string) {
    // SSE provides the event payload as text, so parse it before validating its structure.
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      invalidCount.value++
      return
    }

    // Parsing only proves this is valid JSON
    // Zod checks that it has the fields a log needs.
    const result = LogSchema.safeParse(parsed)
    if (!result.success) {
      invalidCount.value++
      return
    }

    const log = result.data

    if (seen.has(log.id)) return
    seen.add(log.id)

    // Add the new log, then keep the list within the configured age and count limits.
    const { kept, removed } = keepRecentLogs(
      [log, ...logs.value],
      LOG_RETENTION_MS,
      MAX_LOGS,
    )

    removed.forEach(log => seen.delete(log.id))
    logs.value = kept
  }

  // Start periodic cleanup so that logs are deleted even when the feed is temporarily inactive.
  // unlike addLog, this function also tracks the time that passes without any new events.
  let pruneTimer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    pruneTimer = setInterval(() => {
      const cutoff = Date.now() - LOG_RETENTION_MS
      const kept = logs.value.filter(log => Date.parse(log.timestamp) >= cutoff)
      // Skip the array and Set updates when every log is still within the retention window.
      if (kept.length === logs.value.length) return

      // Remove expired IDs from the deduplication Set along with their logs.
      const keptIds = new Set(kept.map(log => log.id))
      logs.value.forEach((log) => {
        if (!keptIds.has(log.id)) seen.delete(log.id)
      })
      // Publish the pruned list so the dashboard and its alert counts update reactively.
      logs.value = kept
    }, REFRESH_MS)
  })

  onBeforeUnmount(() => {
    if (pruneTimer) clearInterval(pruneTimer)
  })

  // Synchronous handling prevents a rapid event stream from overwriting intermediate messages.
  watch(
    data,
    (raw) => {
      if (raw) addLog(raw)
    },
    { flush: 'sync' },
  )

  // A successful reconnect clears the terminal failure state.
  watch(status, (s) => {
    if (s === 'OPEN') failed.value = false
  })

  function retry() {
    failed.value = false
    open()
  }

  return { logs, status, failed, invalidCount, retry, close }
}