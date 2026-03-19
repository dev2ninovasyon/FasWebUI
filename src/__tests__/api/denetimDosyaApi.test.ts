import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '@/api/apiBase'
import {
    createAndFetchBirlesikPdf,
    createBirlesikPdfByFormat,
    denetimDosyaTransfer,
    getCariDosya,
    getDenetimDosya,
    getDenetimDosyaByFormKodu,
    getDenetimDosyaTransfer,
    getHile,
    getLastBirlesikPdf,
    getSurekliDosya,
    releaseBirlesikPdfBlobUrl,
    sendBulkOnay,
} from '@/api/DenetimDosya/DenetimDosya'

vi.mock('@/api/apiBase', () => ({
    apiFetch: vi.fn(),
}))

const mockApiFetch = vi.mocked(apiFetch)

const makeResponse = ({
    ok = true,
    status = 200,
    jsonData,
    textData = '',
    headers = {},
    blobData,
}: {
    ok?: boolean
    status?: number
    jsonData?: unknown
    textData?: string
    headers?: Record<string, string>
    blobData?: Blob
} = {}) =>
    ({
        ok,
        status,
        json: vi.fn().mockResolvedValue(jsonData),
        text: vi.fn().mockResolvedValue(textData),
        blob: vi.fn().mockResolvedValue(blobData ?? new Blob(['pdf'], { type: 'application/pdf' })),
        headers: {
            get: (key: string) => headers[key] ?? headers[key.toLowerCase()] ?? null,
        },
    }) as any

describe('DenetimDosya API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
        vi.stubGlobal('URL', {
            createObjectURL: vi.fn(() => 'blob:generated'),
            revokeObjectURL: vi.fn(),
        } as any)
    })

    it('reads denetim dosya lists with correct boolean query mapping', async () => {
        const payload = [{ id: 1 }]
        mockApiFetch.mockResolvedValue(makeResponse({ jsonData: payload }))

        await expect(getDenetimDosya('Tfrs')).resolves.toEqual(payload)
        await expect(getDenetimDosyaByFormKodu('Bobi', 'FORM-1')).resolves.toEqual(payload)
        await expect(getCariDosya('Bobi')).resolves.toEqual(payload)
        await expect(getSurekliDosya('Tfrs')).resolves.toEqual(payload)
        await expect(getHile('Bobi')).resolves.toEqual(payload)
        await expect(getDenetimDosyaTransfer('Tfrs')).resolves.toEqual(payload)

        expect(mockApiFetch).toHaveBeenCalledWith(
            '/DenetimDosyaBelgeleri/DenetimDosyaListe?tfrsmi=true&bobimi=false',
            expect.objectContaining({ method: 'GET' })
        )
        expect(mockApiFetch).toHaveBeenCalledWith(
            '/DenetimDosyaBelgeleri/CariDosyaListe?tfrsmi=false&bobimi=true',
            expect.objectContaining({ method: 'GET' })
        )
    })

    it('handles transfer, creation and bulk approval flows', async () => {
        mockApiFetch
            .mockResolvedValueOnce(makeResponse({ ok: false, status: 400, jsonData: 'Tasima hatasi', headers: { 'content-type': 'application/json' } }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ status: 404, ok: false }))
            .mockResolvedValueOnce(makeResponse({ ok: true, jsonData: { results: [{ belgeId: 9, success: true }] } }))
            .mockResolvedValueOnce(makeResponse({ ok: false }))

        await expect(denetimDosyaTransfer(1, 2, 3, 2024, 2025, [{ id: 9 }])).resolves.toEqual({ message: 'Tasima hatasi' })
        await expect(createBirlesikPdfByFormat(1, 2, 2025, [{ id: 9, pdf: true, word: false }], 'Tfrs')).resolves.toBe(true)
        await expect(createAndFetchBirlesikPdf(1, 2, 2025, [{ id: 9, pdf: true, word: false }], 'Tfrs', { maxRetries: 1, retryDelayMs: 0 })).resolves.toEqual({
            createUrl: '/DenetimDosyaBelgeleri/EnSonBirlesikPdf?denetciId=1&denetlenenId=2&yil=2025',
            last: null,
        })
        await expect(sendBulkOnay({
            denetciId: 1,
            denetlenenId: 2,
            yil: 2025,
            denetimTuru: 'Tfrs',
            hazirlayanId: 10,
            onaylayanId: 11,
            kaliteKontrolId: 12,
            items: [{ belgeId: 9, belgeAdi: 'Belge', formKodu: 'FORM' }],
        })).resolves.toEqual({ results: [{ belgeId: 9, success: true }] })
        await expect(sendBulkOnay({
            denetciId: 1,
            denetlenenId: 2,
            yil: 2025,
            denetimTuru: 'Tfrs',
            hazirlayanId: null,
            onaylayanId: null,
            kaliteKontrolId: null,
            items: [{ belgeId: 10, belgeAdi: 'Belge', formKodu: 'FORM' }],
        })).resolves.toEqual({ results: [{ belgeId: 10, success: false }] })
    })

    it('supports pdf fetching helpers and release behavior', async () => {
        mockApiFetch
            .mockResolvedValueOnce(makeResponse({
                ok: true,
                status: 200,
                headers: {
                    'content-type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename=\"Rapor.pdf\"',
                },
            }))
            .mockResolvedValueOnce(makeResponse({ ok: false, status: 500, textData: 'server error' }))

        await expect(getLastBirlesikPdf(1, 2, 2025)).resolves.toEqual({
            blobUrl: 'blob:generated',
            fileName: 'Rapor.pdf',
        })

        await expect(createBirlesikPdfByFormat(1, 2, 2025, [{ id: 1, pdf: true, word: false }], 'Bobi')).rejects.toThrow(
            'BirlesikPdfOlustur hata: 500 - server error'
        )

        releaseBirlesikPdfBlobUrl('blob:generated')
        releaseBirlesikPdfBlobUrl('/not-a-blob')

        expect(URL.createObjectURL).toHaveBeenCalled()
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:generated')
    })
})
