import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const warnMock = vi.fn()
const errorMock = vi.fn()
const persistSessionTokensMock = vi.fn()
const clearClientAuthStorageMock = vi.fn()
const buildRefreshRequestBodyMock = vi.fn((refreshToken?: string | null) =>
    refreshToken ? JSON.stringify({ refreshToken }) : undefined
)
const readStoredAuthTokensMock = vi.fn(() => ({
    accessToken: 'stored-access-token',
    refreshToken: 'stored-refresh-token',
}))

vi.mock('@/utils/Logger', () => ({
    default: {
        warn: warnMock,
        error: errorMock,
    },
}))

vi.mock('@/utils/authSession', () => ({
    LOGOUT_INTENT_KEY: 'fas_logout_intent',
    clearClientAuthStorage: clearClientAuthStorageMock,
    buildRefreshRequestBody: buildRefreshRequestBodyMock,
    persistSessionTokens: persistSessionTokensMock,
    readStoredAuthTokens: readStoredAuthTokensMock,
}))

describe('apiFetch', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
    const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})

    beforeEach(() => {
        vi.resetModules()
        vi.clearAllMocks()
        consoleWarnSpy.mockClear()
        consoleErrorSpy.mockClear()
        consoleLogSpy.mockClear()
        consoleGroupSpy.mockClear()
        consoleGroupEndSpy.mockClear()
        window.localStorage.clear()
        window.sessionStorage.clear()
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                href: 'http://localhost:3000/Anasayfa?tab=1',
                pathname: '/Anasayfa',
                search: '?tab=1',
                hostname: 'localhost',
                protocol: 'http:',
            },
        })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('should send custom headers and bearer token for protected requests', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ ok: true }), { status: 200 })
        )
        vi.stubGlobal('fetch', fetchMock)

        window.localStorage.setItem('fas_denetlenenId', '11')
        window.localStorage.setItem('fas_yil', '2024')

        const { apiFetch } = await import('@/api/apiBase')
        const response = await apiFetch('/Test', { method: 'GET' })

        expect(response.ok).toBe(true)
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:5000/api/Test',
            expect.objectContaining({
                credentials: 'include',
                headers: expect.objectContaining({
                    Authorization: 'Bearer stored-access-token',
                    'X-Client-Url': '/Anasayfa?tab=1',
                    'X-Denetlenen-Id': '11',
                    'X-Yil': '2024',
                }),
            })
        )
    })

    it('should not attach authorization header to auth endpoints', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ ok: true }), { status: 200 })
        )
        vi.stubGlobal('fetch', fetchMock)

        const { apiFetch } = await import('@/api/apiBase')
        await apiFetch('/Auth/login', { method: 'POST' })

        const [, requestInit] = fetchMock.mock.calls[0]
        expect((requestInit.headers as Record<string, string>).Authorization).toBeUndefined()
    })

    it('should return undefined for expected baglanti missing response', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response('"Bağlantı oluşturulmamış."', { status: 400 })
        )
        vi.stubGlobal('fetch', fetchMock)

        const { apiFetch } = await import('@/api/apiBase')
        const result = await apiFetch('/BaglantiBilgileri/BaglantiBilgileriByTip')

        expect(result).toBeUndefined()
    })

    it('should refresh session and retry once after a 401 response', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        token: 'renewed-access-token',
                        refreshToken: 'renewed-refresh-token',
                    }),
                    { status: 200 }
                )
            )
            .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))

        vi.stubGlobal('fetch', fetchMock)

        const { apiFetch } = await import('@/api/apiBase')
        const response = await apiFetch('/Protected', { method: 'GET' })

        expect(response.ok).toBe(true)
        expect(fetchMock).toHaveBeenCalledTimes(3)
        expect(buildRefreshRequestBodyMock).toHaveBeenCalledWith('stored-refresh-token')
        expect(persistSessionTokensMock).toHaveBeenCalledWith(
            'renewed-access-token',
            'renewed-refresh-token'
        )
    })

    it('should clear auth and redirect to login when refresh fails after a 401', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                new Response(JSON.stringify({ message: 'Session expired' }), { status: 401 })
            )
            .mockResolvedValueOnce(
                new Response(JSON.stringify({ message: 'refresh failed' }), { status: 401 })
            )

        vi.stubGlobal('fetch', fetchMock)

        const { apiFetch } = await import('@/api/apiBase')

        await expect(apiFetch('/Protected', { method: 'GET' })).rejects.toThrow('Session expired')

        expect(fetchMock).toHaveBeenCalledTimes(2)
        expect(buildRefreshRequestBodyMock).toHaveBeenCalledWith('stored-refresh-token')
        expect(clearClientAuthStorageMock).toHaveBeenCalledTimes(1)
        expect(window.sessionStorage.getItem('fas_logout_reason')).toBe('server_expired')
        expect(window.location.href).toBe('/')
        expect(warnMock).toHaveBeenCalledWith(
            'API 401 - session refresh başarısız',
            expect.objectContaining({
                path: '/Protected',
                refreshStatus: 401,
            }),
            expect.objectContaining({
                source: 'api',
                requestPath: '/Protected',
                statusCode: 401,
            })
        )
    })

    it('should stop after retry limit on repeated 401 responses', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ message: 'Expired again' }), { status: 401 })
        )
        vi.stubGlobal('fetch', fetchMock)

        const { apiFetch } = await import('@/api/apiBase')

        await expect(
            apiFetch('/Protected', { method: 'GET', __retryCount: 1 } as any)
        ).rejects.toThrow('Expired again')

        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(buildRefreshRequestBodyMock).not.toHaveBeenCalled()
        expect(clearClientAuthStorageMock).toHaveBeenCalledTimes(1)
        expect(warnMock).toHaveBeenCalledWith(
            'API 401 - yetkisiz erisim (/Protected)',
            expect.objectContaining({
                reason: 'retry-limit-reached',
                message: 'Expired again',
            }),
            expect.objectContaining({
                source: 'api',
                requestPath: '/Protected',
                statusCode: 401,
            })
        )
    })

    it('should return the response instead of throwing when suppressErrorLog is enabled', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ message: 'validation failed' }), { status: 400 })
        )
        vi.stubGlobal('fetch', fetchMock)

        const { apiFetch } = await import('@/api/apiBase')
        const response = await apiFetch('/Validation', {
            method: 'POST',
            suppressErrorLog: true,
        })

        expect(response.status).toBe(400)
        expect(warnMock).toHaveBeenCalledWith(
            'API yanıt hatası: 400 (/Validation)',
            expect.objectContaining({
                message: 'validation failed',
            }),
            expect.objectContaining({
                source: 'api',
                requestPath: '/Validation',
                statusCode: 400,
            })
        )
        expect(consoleErrorSpy).not.toHaveBeenCalledWith('API ERROR', 400, expect.anything())
    })

    it('should redirect to maintenance and return domain-specific message on connection errors', async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error('Failed to fetch'))
        vi.stubGlobal('fetch', fetchMock)

        const { apiFetch } = await import('@/api/apiBase')

        await expect(apiFetch('/MaddiDogrulama/Calistir', { method: 'POST' })).rejects.toThrow(
            'Muhasebe verileri yüklenemedi. Lütfen sayfayı yenileyin.'
        )

        expect(window.location.href).toBe('/maintenance')
        expect(errorMock).toHaveBeenCalledWith(
            'API bağlantı hatası: /MaddiDogrulama/Calistir',
            expect.objectContaining({
                errorMessage: 'Failed to fetch',
                fullUrl: 'http://localhost:5000/api/MaddiDogrulama/Calistir',
            }),
            expect.objectContaining({
                source: 'network',
                requestPath: '/MaddiDogrulama/Calistir',
            })
        )
    })
})
