/** Keeps panel naming and add/remove behavior out of the page template. */
export function useTablePanels() {
  const panels = ref<TablePanelConfig[]>([createTablePanel('All logs', {})])
  const highlightedPanelId = ref<string | null>(null)
  let highlightTimer: ReturnType<typeof setTimeout> | undefined

  function addToTop(panel: TablePanelConfig) {
    panels.value.unshift(panel)
    highlightedPanelId.value = panel.id

    if (highlightTimer) clearTimeout(highlightTimer)
    highlightTimer = setTimeout(() => {
      if (highlightedPanelId.value === panel.id) highlightedPanelId.value = null
    }, 1500)
  }

  function addPanel() {
    addToTop(createTablePanel(getNextTableTitle(), {}))
  }

  function addFilteredPanel(filters: TableFilters) {
    const title = filters.level
      ? LEVEL_CONFIG[filters.level].label
      : getNextTableTitle()
    addToTop(createTablePanel(title, filters))
  }

  function getNextTableTitle() {
    let number = 1
    while (panels.value.some(panel => panel.title === `Table ${number}`)) number++
    return `Table ${number}`
  }

  function removePanel(id: string) {
    panels.value = panels.value.filter(panel => panel.id !== id)
  }

  function renamePanel(id: string, title: string) {
    const panel = panels.value.find(item => item.id === id)
    if (panel) panel.title = title
  }

  // Clear the highlight timeout if the dashboard is unmounted before it expires.
  onBeforeUnmount(() => {
    if (highlightTimer) clearTimeout(highlightTimer)
  })

  return { panels, highlightedPanelId, addPanel, addFilteredPanel, renamePanel, removePanel }
}