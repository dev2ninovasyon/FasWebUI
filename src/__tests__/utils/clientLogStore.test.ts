import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('clientLogStore', () => {
    beforeEach(() => {
        vi.resetModules()
        window.sessionStorage.clear()
        vi.restoreAllMocks()
        vi.spyOn(crypto, 'randomUUID').mockReturnValue('fixed-log-id')
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-03-11T10:00:00.000Z'))
    })

    it('adds logs, serializes error detail, persists and notifies subscribers', async () => {
        const listener = vi.fn()
        const { addClientLog, getClientLogs, subscribeClientLogs } = await import('@/utils/clientLogStore')

        const unsubscribe = subscribeClientLogs(listener)
        addClientLog({
            level: 'error',
            source: 'api',
            message: 'İstek başarısız',
            route: '/Anasayfa',
            detail: new Error('Timeout'),
            statusCode: 500,
        })

        const [entry] = getClientLogs()

        expect(entry).toMatchObject({
            id: 'fixed-log-id',
            level: 'error',
            source: 'api',
            message: 'İstek başarısız',
            route: '/Anasayfa',
            statusCode: 500,
            timestamp: '2026-03-11T10:00:00.000Z',
        })
        expect(entry.detail).toContain('"message": "Timeout"')
        expect(listener).toHaveBeenCalledTimes(1)
        expect(window.sessionStorage.getItem('fas_client_logs_v1')).toContain('İstek başarısız')

        unsubscribe()
    })

    it('loads valid stored logs and ignores malformed entries', async () => {
        window.sessionStorage.setItem(
            'fas_client_logs_v1',
            JSON.stringify([
                {
                    id: '1',
                    timestamp: '2026-03-10T08:00:00.000Z',
                    level: 'info',
                    source: 'ui',
                    message: 'Geçerli kayıt',
                },
                {
                    id: '2',
                    timestamp: '2026-03-10T08:00:00.000Z',
                    level: 'info',
                    source: 'ui',
                },
            ])
        )

        const { getClientLogs } = await import('@/utils/clientLogStore')
        const logs = getClientLogs()

        expect(logs).toHaveLength(1)
        expect(logs[0].message).toBe('Geçerli kayıt')
    })

    it('clears logs and persists empty state', async () => {
        const { addClientLog, clearClientLogs, getClientLogs } = await import('@/utils/clientLogStore')

        addClientLog({
            level: 'warn',
            source: 'ui',
            message: 'Uyarı',
            route: '/Rapor',
        })
        clearClientLogs()

        expect(getClientLogs()).toEqual([])
        expect(window.sessionStorage.getItem('fas_client_logs_v1')).toBe('[]')
    })

    it('keeps at most 1000 recent logs', async () => {
        const { addClientLog, getClientLogs } = await import('@/utils/clientLogStore')

        for (let index = 0; index < 1005; index += 1) {
            addClientLog({
                level: 'info',
                source: 'system',
                message: `log-${index}`,
                route: '/Test',
            })
        }

        const logs = getClientLogs()

        expect(logs).toHaveLength(1000)
        expect(logs[0].message).toBe('log-1004')
        expect(logs.at(-1)?.message).toBe('log-5')
    })
})
