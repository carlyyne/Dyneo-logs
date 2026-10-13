import { describe, expect, it } from 'vitest'
import { LogSchema, keepRecentLogs } from '../../app/utils/log'
import type { Log } from '../../app/utils/log'

function makeLog(id: string, timestamp: string): Log {
  return {
    id,
    timestamp,
    level: 'info',
    service: 'api',
    message: 'Request completed',
    duration_ms: 12,
    metadata: {
      request_id: `request-${id}`,
      user_id: 7,
      http_status: 200,
    },
  }
}

describe('keepRecentLogs', () => {
  it('écarte les logs trop anciens', () => {

    const logs = [ // 3min entre les 2 logs
      makeLog('old', '2026-01-01T09:57:00.000Z'),
      makeLog('recent', '2026-01-01T10:00:00.000Z'),
    ]

    const result = keepRecentLogs(logs, 2 * 60_000, 100) // 2 min en ms

    expect(result.kept.map(log => log.id)).toEqual(['recent'])
    expect(result.removed.map(log => log.id)).toEqual(['old'])
  })

  it('limite le nombre de logs conservés', () => {

    const logs = [
      makeLog('older', '2026-01-01T09:59:00.000Z'),
      makeLog('newer', '2026-01-01T10:00:00.000Z'),
    ]

    const result = keepRecentLogs(logs, 5 * 60_000, 1) // limite à 1 seul log

    expect(result.kept.map(log => log.id)).toEqual(['newer']) // garde le log le plus recent (liste triee par keepRecentLogs du plus recent au plus vieux)
    expect(result.removed.map(log => log.id)).toEqual(['older'])
  })
})

describe('LogSchema', () => {
  it('accepte un log valide', () => {
    expect(LogSchema.safeParse(makeLog('one', '2026-01-01T10:00:00.000Z')).success).toBe(true)
  })

  it('rejette un niveau inconnu', () => {
    const log = { ...makeLog('one', '2026-01-01T10:00:00.000Z'), level: 'notice' }
    
    expect(LogSchema.safeParse(log).success).toBe(false)
  })
})