import { beforeEach, describe, expect, it, vi } from 'vitest'

const addClientLogMock = vi.fn()
const axiosPostMock = vi.fn(() => Promise.resolve())
const createAuthorizedAxiosConfigMock = vi.fn(() => ({
    headers: { Authorization: 'Bearer token' },
    withCredentials: true,
}))

vi.mock('axios', () => ({
    default: {
        post: axiosPostMock,
    },
}))

vi.mock('@/utils/clientLogStore', () => ({
    addClientLog: addClientLogMock,
}))

vi.mock('@/utils/authSession', () => ({
    createAuthorizedAxiosConfig: createAuthorizedAxiosConfigMock,
}))

vi.mock('@/api/apiConfig', () => ({
    url: 'http://localhost:5000/api',
}))

describe('Logger', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    beforeEach(() => {
        vi.clearAllMocks()
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                ...window.location,
                pathname: '/Veri',
            },
        })
    })

    it('writes error logs to client storage and server', async () => {
        const Logger = (await import('@/utils/Logger')).default
        const error = new Error('boom')

        await Logger.error('Sunucu hatasi', error, {
            source: 'api',
            requestPath: '/Protected',
            statusCode: 500,
        })

        expect(consoleErrorSpy).toHaveBeenCalledWith('[Frontend Error]: Sunucu hatasi', error)
        expect(addClientLogMock).toHaveBeenCalledWith({
            level: 'error',
            source: 'api',
            message: 'Sunucu hatasi',
            route: '/Veri',
            requestPath: '/Protected',
            statusCode: 500,
            detail: error,
        })
        expect(axiosPostMock).toHaveBeenCalledWith(
            'http://localhost:5000/api/Audit/ClientLog',
            expect.objectContaining({
                level: 'error',
                message: 'Sunucu hatasi',
                route: '/Veri',
                source: 'api',
                detail: '{}',
                timestamp: expect.any(String),
            }),
            {
                headers: { Authorization: 'Bearer token' },
                withCredentials: true,
            }
        )
    })

    it('uses explicit route metadata for warning logs', async () => {
        const Logger = (await import('@/utils/Logger')).default

        await Logger.warn('Yetki uyarisi', { role: 'viewer' }, {
            route: '/Musteri',
            source: 'ui',
        })

        expect(consoleWarnSpy).toHaveBeenCalledWith('[Frontend Warn]: Yetki uyarisi', { role: 'viewer' })
        expect(addClientLogMock).toHaveBeenCalledWith({
            level: 'warn',
            source: 'ui',
            message: 'Yetki uyarisi',
            route: '/Musteri',
            requestPath: undefined,
            statusCode: undefined,
            detail: { role: 'viewer' },
        })
    })

    it('writes info logs with the current route', async () => {
        const Logger = (await import('@/utils/Logger')).default

        await Logger.info('Bilgi mesaji', 'detay')

        expect(consoleLogSpy).toHaveBeenCalledWith('[Frontend Info]: Bilgi mesaji', 'detay')
        expect(addClientLogMock).toHaveBeenCalledWith({
            level: 'info',
            source: 'ui',
            message: 'Bilgi mesaji',
            route: '/Veri',
            requestPath: undefined,
            statusCode: undefined,
            detail: 'detay',
        })
    })
})
