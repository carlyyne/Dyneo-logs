export function useSampleData() {
  const logs = shallowRef<Log[]>([])
  const status = ref<'CONNECTING' | 'OPEN' | 'CLOSED'>('CONNECTING')
  const failed = ref(false)
  const invalidCount = ref(0)
  let sampleLogsLoaded = false

  // The demo source has no network connection, but mirrors its start/stop controls.
  function retry() {
    if (sampleLogsLoaded) status.value = 'OPEN'
  }

  function close() {
    status.value = 'CLOSED'
  }

  onMounted(async () => {
    const raw = await $fetch<unknown>('/sample-logs.json')
    logs.value = LogSchema.array().parse(raw)
    sampleLogsLoaded = true
    status.value = 'OPEN'
  })

  return { logs, status, failed, invalidCount, retry, close }
}