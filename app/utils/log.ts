import { z } from 'zod'

// The schema is the single source of truth for incoming log validation and TypeScript types.
export const LogLevelSchema = z.enum(['debug', 'info', 'warning', 'error', 'critical'])

export const LogSchema = z.object({
  id: z.string(),
  timestamp: z.iso.datetime(),
  level: LogLevelSchema,
  service: z.string(),
  message: z.string(),
  duration_ms: z.number(),
  metadata: z.object({
    request_id: z.string(),
    user_id: z.number(),
    http_status: z.number(),
  }),
})

export type Log = z.infer<typeof LogSchema>

// Sort newest logs first, then keep only logs within the time window and count limit.
// Return removed logs so the caller can also release their IDs from the deduplication set.
export function keepRecentLogs(logs: Log[], maxAgeMs: number, maxCount: number) {
  const ordered = [...logs].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
  const newestTimestamp = Date.parse(ordered[0]?.timestamp ?? '')
  if (!Number.isFinite(newestTimestamp)) return { kept: [] as Log[], removed: ordered }

  const oldestAllowed = newestTimestamp - maxAgeMs
  const recent = ordered.filter(log => Date.parse(log.timestamp) >= oldestAllowed)
  return { kept: recent.slice(0, maxCount), removed: recent.slice(maxCount).concat(ordered.filter(log => Date.parse(log.timestamp) < oldestAllowed)) }
}