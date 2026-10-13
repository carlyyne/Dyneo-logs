/** Formats an ISO timestamp for the compact time column. */
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-FR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-FR')
}

/** Keeps short durations readable. */
export function formatDuration(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(3)} s` : `${ms} ms`
}