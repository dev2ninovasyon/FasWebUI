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
}))

vi.mock('@/utils/SecureTokenManager', () => ({
    default: {},
}))

describe('Fatura API helpers', () => {
    const user = {
        denetciId: 8,
        yil: 2025,
        denetlenenId: 55,
        token: 'token-1',
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('fetches paged lists and detail payloads', async () => {
        apiFetchMock
            .mockResolvedValueOnce({ json: async () => ({ items: [{ id: '1' }], totalCount: 1, page: 1, pageSize: 20 }) })
            .mockResolvedValueOnce({ json: async () => ({ items: [{ id: '2' }], totalCount: 1, page: 1, pageSize: 10 }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'detay-1' }) })

        const {
            fetchPagedFaturalarFull,
            fetchPagedFaturalarLite,
            fetchFaturaDetail,
        } = await import('@/api/Fatura/FaturaApi')

        await expect(fetchPagedFaturalarFull(8, 2025, 55, 1, 20, 'Alınan', { vkn: ['123'] })).resolves.toEqual({
            items: [{ id: '1' }],
            totalCount: 1,
            page: 1,
            pageSize: 20,
        })
        await expect(fetchPagedFaturalarLite(8, 2025, 55, 1, 10, 'Satış', { durum: ['Yeni'] })).resolves.toEqual({
            items: [{ id: '2' }],
            totalCount: 1,
            page: 1,
            pageSize: 10,
        })
        await expect(fetchFaturaDetail(8, 2025, 55, 'detay-1')).resolves.toEqual({ id: 'detay-1' })

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/Invoices/FilteredPagedFull?denetciId=8&yil=2025&denetlenenId=55&page=1&pageSize=20&tip=Al%C4%B1nan',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ vkn: ['123'] }),
            })
        )
    })

    it('uploads files and reads dependent invoice resources', async () => {
        axiosPostMock.mockResolvedValue({ status: 200, data: { uploaded: true } })
        const blob = new Blob(['<html></html>'], { type: 'text/html' })

        apiFetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'job-1' }] })
            .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'file-1' }] })
            .mockResolvedValueOnce({ ok: true, blob: async () => blob })
            .mockResolvedValueOnce({ ok: true, json: async () => [{ invoiceId: 'inv-1' }] })
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: true, json: async () => [{ matchId: 'sent-1' }] })
            .mockResolvedValueOnce({ ok: true, json: async () => [{ matchId: 'received-1' }] })

        const {
            uploadFaturaDosyalari,
            getYuklemeIslemleri,
            getYuklemeDosyalari,
            previewFaturaHtmlNewTab,
            findInvoiceYevmiyeRowsByVkn,
            saveInvoiceYevmiyeMatches,
            getSentInvoiceMatches,
            getReceivedInvoiceMatches,
        } = await import('@/api/Fatura/FaturaApi')

        const uploadResult = await uploadFaturaDosyalari(
            user,
            [new File(['x'], 'a.xml', { type: 'text/xml' })],
            'Alınan',
            'Yukle'
        )
        expect(uploadResult).toEqual({ status: 200, data: { uploaded: true } })
        await expect(getYuklemeIslemleri(user)).resolves.toEqual([{ id: 'job-1' }])
        await expect(getYuklemeDosyalari(user, 'job-1')).resolves.toEqual([{ id: 'file-1' }])
        await expect(previewFaturaHtmlNewTab(user, 'dosya-1')).resolves.toBe(blob)
        await expect(findInvoiceYevmiyeRowsByVkn(user, 'Satış', '1234567890')).resolves.toEqual([{ invoiceId: 'inv-1' }])
        await expect(saveInvoiceYevmiyeMatches(user, [{ invoiceId: 'inv-1', amount: 10, kdv: 2, matched: true } as any])).resolves.toBe(true)
        await expect(getSentInvoiceMatches(user)).resolves.toEqual([{ matchId: 'sent-1' }])
        await expect(getReceivedInvoiceMatches(user)).resolves.toEqual([{ matchId: 'received-1' }])

        expect(axiosPostMock).toHaveBeenCalledWith(
            'http://localhost:5000/api/Invoices/Upload?denetciId=8&yil=2025&denetlenenId=55&tip=Al%C4%B1nan&islemAdi=Yukle',
            expect.any(FormData),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer token-1',
                    'Content-Type': 'multipart/form-data',
                }),
            })
        )
    })

    it('throws on failing detail and dependent resource calls', async () => {
        apiFetchMock
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })

        const {
            fetchFaturaDetail,
            getYuklemeIslemleri,
            getYuklemeDosyalari,
            previewFaturaHtmlNewTab,
            deleteYuklemeIslemleri,
            findInvoiceYevmiyeRowsByVkn,
            saveInvoiceYevmiyeMatches,
        } = await import('@/api/Fatura/FaturaApi')

        await expect(fetchFaturaDetail(8, 2025, 55, 'detay-404')).rejects.toThrow('Fatura detayı alınamadı')
        await expect(getYuklemeIslemleri(user)).rejects.toThrow('Yükleme işlemleri alınamadı')
        await expect(getYuklemeDosyalari(user, 'job-404')).rejects.toThrow('Dosyalar alınamadı')
        await expect(previewFaturaHtmlNewTab(user, 'dosya-404')).rejects.toThrow('Sunucudan beklenen içerik tipi dönmedi')
        await expect(deleteYuklemeIslemleri(user, ['1'])).rejects.toThrow('Silinemedi')
        await expect(findInvoiceYevmiyeRowsByVkn(user, 'Satış', '123')).rejects.toThrow('Satırlar alınamadı')
        await expect(saveInvoiceYevmiyeMatches(user, [])).rejects.toThrow('Eşleştirmeler kaydedilemedi')
    })
})
