import type { Ref } from 'vue'

type FilterOption<Value extends string> = {
  label: string
  value: Value
}

/** Applies each table's local controls together with its optional starting filter. */
export function useTableFilters(logs: Ref<Log[]>, initialFilters: Readonly<Ref<TableFilters>>) {
  const search = ref('')
  const selectedLevel = ref<Log['level'] | 'all'>(
    initialFilters.value.level ?? 'all',
  )
  const selectedService = ref(initialFilters.value.service ?? 'all')
  const selectedUserId = ref(initialFilters.value.userId ?? '')
  const knownServices = ref<string[]>([])

  // Append new services once so live arrivals and expired logs never reorder existing choices.
  watch(logs, (currentLogs) => 
    { knownServices.value = [...new Set([...knownServices.value, ...currentLogs.map(log => log.service),])]
  }, { immediate: true })

  // A panel's default User/Service filter can be assigned after the log source loads.
  watch(initialFilters, (filters) => {
    selectedLevel.value = filters.level ?? 'all'
    selectedService.value = filters.service ?? 'all'
    selectedUserId.value = filters.userId ?? ''
  })

  const levels = computed<FilterOption<Log['level'] | 'all'>[]>(() => [
    { label: 'All levels', value: 'all' },
    ...LEVELS.map(level => ({ label: LEVEL_CONFIG[level].label, value: level })),
  ])

  const services = computed<FilterOption<string>[]>(() => [
    { label: 'All services', value: 'all' },
    ...[...new Set([
      ...knownServices.value,
      ...(selectedService.value === 'all' ? [] : [selectedService.value]),
    ])]
      .map(service => ({ label: service, value: service })),
  ])

  const filteredLogs = computed(() => {
    const query = search.value.trim().toLocaleLowerCase()
    return logs.value
      .filter((log) => {
        const levelMatches = selectedLevel.value === 'all' || log.level === selectedLevel.value
        const serviceMatches = selectedService.value === 'all' || log.service === selectedService.value
        const userMatches = !selectedUserId.value || String(log.metadata.user_id).includes(selectedUserId.value.trim())
        const searchMatches = !query || [log.level, log.service, log.message, log.metadata.user_id]
          .some(value => String(value).toLocaleLowerCase().includes(query))

        return levelMatches && serviceMatches && userMatches && searchMatches
      })
  })

  const visibleLogs = computed(() => filteredLogs.value.slice(0, DISPLAY_LIMIT))

  function resetFilters() {
    search.value = ''
    selectedLevel.value = 'all'
    selectedService.value = 'all'
    selectedUserId.value = ''
  }

  return { search, selectedLevel, selectedService, selectedUserId, levels,
    services, filteredLogs, visibleLogs, resetFilters,}
}