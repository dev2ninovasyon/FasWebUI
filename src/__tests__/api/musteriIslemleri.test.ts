import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()
const axiosPostMock = vi.fn()
const createAuthorizedAxiosConfigMock = vi.fn((config = {}, token?: string) => ({
    ...config,
    headers: {
        Authorization: `Bearer ${token}`,
        ...(config as any).headers,
    },
}))
const readStoredAuthTokensMock = vi.fn(() => ({
    accessToken: 'stored-access',
}))

vi.mock('@/api/apiBase', () => ({
    apiFetch: apiFetchMock,
    url: 'http://localhost:5000/api',
}))

vi.mock('axios', () => ({
    default: {
        post: axiosPostMock,
    },
}))

vi.mock('@/utils/authSession', () => ({
    createAuthorizedAxiosConfig: createAuthorizedAxiosConfigMock,
    readStoredAuthTokens: readStoredAuthTokensMock,
}))

describe('MusteriIslemleri API helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                ...window.location,
                pathname: '/Musteri',
                search: '?tab=1',
            },
        })
        window.localStorage.clear()
        window.localStorage.setItem('fas_denetlenenId', '55')
        window.localStorage.setItem('fas_yil', '2024')
    })

    it('starts import jobs and returns queue payloads', async () => {
        apiFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ jobId: 'job-1' }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ jobId: 'job-2' }),
            })

        const { startImportFromOldJob, startImportFromOldPipelineJob } = await import(
            '@/api/Musteri/MusteriIslemleri'
        )

        await expect(
            startImportFromOldJob({
                TasinanDenetlenenId: 12,
                Years: [2022, 2023],
                TableKeys: ['Subeler'],
                Yil: 2024,
            })
        ).resolves.toEqual({ jobId: 'job-1' })

        await expect(
            startImportFromOldPipelineJob({
                TableKey: 'MusteriImport',
                DenetciId: 3,
                TasinanDenetlenenId: 12,
                Yil: 2024,
            })
        ).resolves.toEqual({ jobId: 'job-2' })
    })

    it('reads import job status and notifications, and throws when backend rejects', async () => {
        apiFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ state: 'completed' }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ id: 1, mesaj: 'done' }],
            })
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })

        const {
            getImportJobStatus,
            getImportJobNotifications,
            getImportPipelineJobStatus,
        } = await import('@/api/Musteri/MusteriIslemleri')

        await expect(getImportJobStatus('job-1')).resolves.toEqual({ state: 'completed' })
        await expect(getImportJobNotifications('job-1')).resolves.toEqual([{ id: 1, mesaj: 'done' }])
        await expect(getImportJobStatus('job-404')).rejects.toThrow('Job bulunamadı')
        await expect(getImportPipelineJobStatus('job-404')).rejects.toThrow('Job bulunamadı')
    })

    it('uploads kurumlar beyannamesi with auth headers and progress updates', async () => {
        axiosPostMock.mockImplementation(async (_url, _formData, config) => {
            config.onUploadProgress?.({ loaded: 50, total: 100 })
            return {
                status: 200,
                data: { parsed: true },
            }
        })

        const onProgress = vi.fn()
        const file = new File(['content'], 'kvb.xml', { type: 'text/xml' })
        const { uploadAndParseKurumlarBeyannamesi } = await import('@/api/Musteri/MusteriIslemleri')

        const result = await uploadAndParseKurumlarBeyannamesi(file, 8, 2024, 55, onProgress)

        expect(result).toEqual({
            success: true,
            data: { parsed: true },
            message: 'Dosya yüklendi ve veriler çekildi.',
        })
        expect(onProgress).toHaveBeenNthCalledWith(1, 50)
        expect(onProgress).toHaveBeenLastCalledWith(100)
        expect(axiosPostMock).toHaveBeenCalledWith(
            'http://localhost:5000/api/Veri/UploadAndParseKurumlarBeyannamesi?denetciId=8&yil=2024&denetlenenId=55&tip=KurumlarBeyannamesi',
            expect.any(FormData),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer stored-access',
                    'Content-Type': 'multipart/form-data',
                    'X-Client-Url': '/Musteri?tab=1',
                    'X-Denetlenen-Id': '55',
                    'X-Yil': '2024',
                }),
            })
        )
    })

    it('returns mapped error message when upload request fails', async () => {
        axiosPostMock.mockRejectedValue({
            response: {
                data: {
                    message: 'Dosya okunamadi',
                },
            },
        })

        const file = new File(['content'], 'kvb.xml', { type: 'text/xml' })
        const { uploadAndParseKurumlarBeyannamesi } = await import('@/api/Musteri/MusteriIslemleri')

        await expect(uploadAndParseKurumlarBeyannamesi(file, 8, 2024, 55)).resolves.toEqual({
            success: false,
            message: 'Dosya okunamadi',
        })
    })

    it('returns lists for company selection endpoints and falls back to empty arrays on failures', async () => {
        apiFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ id: 1, firmaAdi: 'A' }],
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Server Error',
            })
            .mockRejectedValueOnce(new Error('offline'))

        const {
            getDenetlenenByDenetciId,
            getDenetlenenByRol,
            getDenetlenenByDenetciIdForSelection,
        } = await import('@/api/Musteri/MusteriIslemleri')

        await expect(getDenetlenenByDenetciId(7)).resolves.toEqual([{ id: 1, firmaAdi: 'A' }])
        await expect(getDenetlenenByRol(7, 9)).resolves.toEqual([])
        await expect(getDenetlenenByDenetciIdForSelection(7)).resolves.toEqual([])
    })
})
