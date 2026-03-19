import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()
const enqueueSnackbarMock = vi.fn()

vi.mock('@/api/apiBase', () => ({
    apiFetch: apiFetchMock,
    url: 'http://localhost:5000/api',
}))

vi.mock('@/utils/SecureTokenManager', () => ({
    default: {
        getAccessToken: vi.fn(() => 'secure-token'),
    },
}))

vi.mock('@microsoft/signalr', () => ({
    HubConnectionBuilder: vi.fn(),
    LogLevel: {
        Warning: 'warning',
        Information: 'information',
    },
    HubConnectionState: {
        Disconnected: 0,
        Connected: 1,
        Connecting: 2,
        Reconnecting: 3,
    },
}))

vi.mock('notistack', () => ({
    enqueueSnackbar: enqueueSnackbarMock,
}))

describe('BaglantiBilgileri API helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()
        vi.spyOn(console, 'log').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('treats health check success and backend error codes as reachable', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({ ok: true, status: 200 })
            .mockResolvedValueOnce({ ok: false, status: 503 })

        vi.stubGlobal('fetch', fetchMock)

        const { testSignalRConnection } = await import('@/api/BaglantiBilgileri/BaglantiBilgileri')

        await expect(testSignalRConnection()).resolves.toBe(true)
        await expect(testSignalRConnection()).resolves.toBe(true)

        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            'http://localhost:5000/api/health',
            expect.objectContaining({ method: 'GET' })
        )
    })

    it('returns false when health check request fails', async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error('offline'))
        vi.stubGlobal('fetch', fetchMock)

        const { testSignalRConnection } = await import('@/api/BaglantiBilgileri/BaglantiBilgileri')

        await expect(testSignalRConnection()).resolves.toBe(false)
    })

    it('shows info snackbar when typed connection is missing and notifyIfMissing is enabled', async () => {
        apiFetchMock.mockResolvedValue(undefined)

        const { getBaglantiBilgileriByTip } = await import('@/api/BaglantiBilgileri/BaglantiBilgileri')

        await expect(getBaglantiBilgileriByTip(1, 2, 3, 2024, 'KYS', { notifyIfMissing: true })).resolves.toBeUndefined()

        expect(enqueueSnackbarMock).toHaveBeenCalledWith('Paylaşım bağlantısı oluşturulmamış.', {
            variant: 'info',
            autoHideDuration: 4000,
        })
    })

    it('returns payload or throws mapped errors for typed connection lookups', async () => {
        apiFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ id: 8, link: 'abc' }),
            })
            .mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Baglanti yok' }),
            })

        const { getBaglantiBilgileriByTip } = await import('@/api/BaglantiBilgileri/BaglantiBilgileri')

        await expect(getBaglantiBilgileriByTip(1, 2, 3, 2024, 'KYS')).resolves.toEqual({ id: 8, link: 'abc' })
        await expect(getBaglantiBilgileriByTip(1, 2, 3, 2024, 'KYS')).rejects.toThrow('Baglanti yok')
    })

    it('creates and deletes connection records with boolean results', async () => {
        apiFetchMock
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })

        const {
            createBaglantiBilgileri,
            deleteBaglantiBilgileri,
            deleteBaglantiBilgileriById,
            updateBildirimlerOkundumu,
        } = await import('@/api/BaglantiBilgileri/BaglantiBilgileri')

        await expect(createBaglantiBilgileri(1, 2, 3, 2024, 'KYS', 'https://app.test/share?id=5')).resolves.toBe(true)
        await expect(deleteBaglantiBilgileri(1, 2, 3, 2024)).resolves.toBe(false)
        await expect(deleteBaglantiBilgileriById(1, 2, 3, 2024, 99)).resolves.toBe(true)
        await expect(updateBildirimlerOkundumu([11, 12])).resolves.toBe(false)

        expect(apiFetchMock).toHaveBeenNthCalledWith(
            1,
            '/BaglantiBilgileri/BaglantiBilgileri?denetciId=1&yil=2024&denetlenenId=2&kullaniciId=3&tip=KYS&kaynakUrl=https%3A%2F%2Fapp.test%2Fshare%3Fid%3D5',
            expect.objectContaining({ method: 'POST' })
        )
        expect(apiFetchMock).toHaveBeenNthCalledWith(
            4,
            '/BaglantiBilgileri/BildirimlerOkundumu',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify([11, 12]),
            })
        )
    })

    it('gets links by direct url and fetches notifications', async () => {
        apiFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ id: 4, tip: 'KYS' }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ id: 1, mesaj: 'Yeni bildirim' }],
            })

        const { getBaglantiBilgileriByLink, getBildirimler } = await import(
            '@/api/BaglantiBilgileri/BaglantiBilgileri'
        )

        await expect(getBaglantiBilgileriByLink('https://app.test/path?a=1&b=2')).resolves.toEqual({
            id: 4,
            tip: 'KYS',
        })
        await expect(getBildirimler(77)).resolves.toEqual([{ id: 1, mesaj: 'Yeni bildirim' }])
    })
})
