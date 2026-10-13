export const LOG_STREAM_BASE_URL = 'https://technical-exercise.dyneo.io'
export const USE_SAMPLE_LOGS = false
export const LOG_STREAM_TAIL = 50

// Retention and rendering limits help keep large live streams responsive.
export const KEEP_LAST_MINUTES = 3
export const LOG_RETENTION_MS = KEEP_LAST_MINUTES * 60_000 //conservation logs (ms)
export const MAX_LOGS = 2000
export const DISPLAY_LIMIT = 100
export const REFRESH_MS = 1000

// Derive the filter levels from the validation schema so the list has one source of truth.
export const LEVELS = LogLevelSchema.options
export const LEVEL_CONFIG = {
  debug: { label: 'Debug', color: 'neutral', rowClass: '' },
  info: { label: 'Info', color: 'info', rowClass: '' },
  warning: { label: 'Warning', color: 'warning', rowClass: 'bg-warning/10' },
  error: { label: 'Error', color: 'error', rowClass: 'bg-error/10' },
  critical: { label: 'Critical', color: 'error', rowClass: 'bg-error/25' },
} as const

export const TABLE_PAGE_SIZE = { // Show more rows with one or two panels; use compact tables once the dashboard is denser.
  standard: 12,
  compact: 4,
}
export const COMPACT_TABLES_FROM_COUNT = 3