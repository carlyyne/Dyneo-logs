export type TablePanelConfig = {
  id: string
  title: string
  filters: TableFilters
}

export type TableFilters = {
  level?: Log['level']
  service?: string
  userId?: string
}

export function createTablePanel(title: string, filters: TableFilters): TablePanelConfig {
  return { id: crypto.randomUUID(), title, filters }
}