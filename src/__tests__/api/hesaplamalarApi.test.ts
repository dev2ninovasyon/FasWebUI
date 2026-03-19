import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '@/api/apiBase'
import {
    createAmortismanHesaplanmis,
    createBeklenenKrediZarariHesaplanmis,
    createCekSenetReeskontEkBilgi,
    createCekSenetReeskontHesapla,
    createDavaKarsiliklariHesaplanmis,
    createHareketsizStok,
    createHareketsizStoklar,
    createHareketsizTicariAlacak,
    createHareketsizTicariAlacaklar,
    createKidemTazminatiBobiEkBilgi,
    createKidemTazminatiBobiHesapla,
    createKidemTazminatiTfrsEkBilgi,
    createKidemTazminatiTfrsHesapla,
    createKrediHesaplanmis,
    createVadeliBankaMevduatiFaizTahakkuk,
    createVadeliBankaMevduatOtomatikSiniflama,
    createVergiVarligiVeYukumlulugu,
    createYaslandirmaHesaplanmis,
    deleteHareketsizStoklarById,
    deleteHareketsizTicariAlacaklarById,
    deleteVadeliBankaMevduatiOtomatikSiniflamaById,
    getAmortismanHesaplanmis,
    getBeklenenKrediZarariHesaplanmis,
    getCekSenetReeskontDuzeltmeFarklari,
    getCekSenetReeskontEkBilgi,
    getCekSenetReeskontHesaplama,
    getCekSenetReeskontHesaplamadaKullanilanDegerler,
    getCekSenetReeskontIskontoOranlari,
    getDavaKarsiliklariHesaplanmis,
    getDovizKurlariOtuzBirAralik,
    getEnflasyonOrani,
    getFaizOrani,
    getGecmisYilKarZararKontrol,
    getGecmisYilKarZararKontrolOrnekFisler,
    getHareketsizStoklar,
    getHareketsizStoklarOrnekFisler,
    getHareketsizStoklarOzet,
    getHareketsizTicariAlacaklar,
    getHareketsizTicariAlacaklarOrnekFisler,
    getHareketsizTicariAlacaklarOzet,
    getIliskiliTarafSiniflama,
    getIliskiliTarafSiniflamaHesaplar,
    getIliskiliTarafSiniflamaOrnekFisler,
    getIskontoOrani,
    getKidemTazminatiBobiEkBilgi,
    getKidemTazminatiTfrsEkBilgi,
    getKrediHesaplanmis,
    getKrediHesaplanmisBakiye,
    getKrediHesaplanmisDetay,
    getKrediHesaplanmisOrnekFisler,
    getKrediMizanKarsilastirmasi,
    getKurFarki,
    getKurFarkiKontrolleriFisler,
    getKurFarkiKontrolleriOzet,
    getKurFarkiOrnekFisler,
    getVadeliBankaMevduatiFaizTahakkuk,
    getVadeliBankaMevduatiManuelSiniflama,
    getVadeliBankaMevduatiManuelSiniflamaOrnekFisler,
    getVadeliBankaMevduatiOtomatikSiniflama,
    getVadeliBankaMevduatiOtomatikSiniflamaOrnekFisler,
    getVergiVarligi,
    getVergiVarligiTumDetay,
    getVergiVarligiVeYukumluluguOrnekFisler,
    getVergiVarligiVeYukumluluguOzet,
    getVergiYukumlulugu,
    getYaslandirmaHesaplanmis,
} from '@/api/Hesaplamalar/Hesaplamalar'

vi.mock('@/api/apiBase', () => ({
    apiFetch: vi.fn(),
}))

const mockApiFetch = vi.mocked(apiFetch)

const makeResponse = ({
    ok = true,
    status = 200,
    jsonData,
}: {
    ok?: boolean
    status?: number
    jsonData?: unknown
} = {}) =>
    ({
        ok,
        status,
        json: vi.fn().mockResolvedValue(jsonData),
    }) as any

describe('Hesaplamalar API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('covers high-volume read endpoints', async () => {
        const payload = [{ id: 1 }]
        mockApiFetch.mockResolvedValue(makeResponse({ jsonData: payload }))

        const results = await Promise.all([
            getAmortismanHesaplanmis(1, 2025, 2),
            getDavaKarsiliklariHesaplanmis(1, 2025, 2),
            getYaslandirmaHesaplanmis(1, 2025, 2),
            getKidemTazminatiBobiEkBilgi(1, 2025, 2),
            getKidemTazminatiTfrsEkBilgi(1, 2025, 2),
            getCekSenetReeskontEkBilgi(1, 2025, 2),
            getCekSenetReeskontIskontoOranlari(1, 2025, 2),
            getCekSenetReeskontHesaplama(1, 2025, 2),
            getCekSenetReeskontDuzeltmeFarklari(1, 2025, 2),
            getCekSenetReeskontHesaplamadaKullanilanDegerler(1, 2025, 2),
            getBeklenenKrediZarariHesaplanmis(1, 2025, 2),
            getEnflasyonOrani(2025),
            getFaizOrani(2025),
            getIskontoOrani(2025),
            getVergiVarligiVeYukumluluguOzet(1, 2025, 2),
            getVergiVarligi(1, 2025, 2, true),
            getVergiVarligiTumDetay(1, 2025, 2),
            getVergiYukumlulugu(1, 2025, 2, true),
            getVergiVarligiVeYukumluluguOrnekFisler(1, 2025, 2),
            getIliskiliTarafSiniflamaHesaplar(1, 2025, 2),
            getIliskiliTarafSiniflama(1, 2025, 2),
            getIliskiliTarafSiniflamaOrnekFisler(1, 2025, 2),
            getVadeliBankaMevduatiOtomatikSiniflama(1, 2025, 2),
            getVadeliBankaMevduatiOtomatikSiniflamaOrnekFisler(1, 2025, 2),
            getVadeliBankaMevduatiManuelSiniflama(1, 2025, 2),
            getVadeliBankaMevduatiManuelSiniflamaOrnekFisler(1, 2025, 2),
            getVadeliBankaMevduatiFaizTahakkuk(1, 2025, 2, true),
            getHareketsizTicariAlacaklar(1, 2025, 2, true),
            getHareketsizTicariAlacaklarOzet(1, 2025, 2, true),
            getHareketsizTicariAlacaklarOrnekFisler(1, 2025, 2, true),
            getHareketsizStoklar(1, 2025, 2, true),
            getHareketsizStoklarOzet(1, 2025, 2, true),
            getHareketsizStoklarOrnekFisler(1, 2025, 2, true),
            getGecmisYilKarZararKontrol(1, 2025, 2),
            getGecmisYilKarZararKontrolOrnekFisler(1, 2025, 2),
            getKurFarki(1, 2025, 2),
            getKurFarkiKontrolleriOzet(1, 2025, 2, 100, '100', '2025-01-01', '2025-12-31'),
            getKurFarkiKontrolleriFisler(1, 2025, 2, 100, '100', '2025-01-01', '2025-12-31'),
            getKurFarkiOrnekFisler(1, 2025, 2),
            getDovizKurlariOtuzBirAralik(),
            getKrediMizanKarsilastirmasi(1, 2025, 2),
        ])

        expect(results.every((result) => result === payload)).toBe(true)
        expect(mockApiFetch).toHaveBeenCalledWith(
            expect.stringContaining('/Hesaplamalar/VergiVarligi?denetciId=1&denetlenenId=2&yil=2025&konsolide=true'),
            expect.objectContaining({ method: 'GET' })
        )
        expect(mockApiFetch).toHaveBeenCalledWith(
            expect.stringContaining('/Evds/DovizKurlariOtuzBirAralik'),
            expect.objectContaining({ method: 'GET' })
        )
    })

    it('covers write endpoints and special return shapes', async () => {
        const hesaplamaPayload = { hesaplandi: true }
        const cekSenetPayload = { toplam: 5 }
        mockApiFetch
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true, jsonData: { warnings: ['kontrol et'] } }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true, jsonData: hesaplamaPayload }))
            .mockResolvedValueOnce(makeResponse({ ok: true, jsonData: hesaplamaPayload }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true, jsonData: cekSenetPayload }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true, jsonData: { success: true } }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))
            .mockResolvedValueOnce(makeResponse({ ok: true }))

        await expect(createAmortismanHesaplanmis(1, 2025, 2, 'Normal')).resolves.toBe(true)
        await expect(createDavaKarsiliklariHesaplanmis(1, 2025, 2, 10)).resolves.toBe(true)
        await expect(createKrediHesaplanmis(1, 2025, 2)).resolves.toEqual({ success: true, warnings: ['kontrol et'] })
        await expect(createYaslandirmaHesaplanmis(1, 2025, 2)).resolves.toBe(true)
        await expect(createKidemTazminatiBobiHesapla(1, 2025, 2)).resolves.toEqual(hesaplamaPayload)
        await expect(createKidemTazminatiTfrsHesapla(1, 2025, 2)).resolves.toEqual(hesaplamaPayload)
        await expect(createKidemTazminatiBobiEkBilgi({ denetciId: 1, yil: 2025, denetlenenId: 2, oran: 5 })).resolves.toBe(true)
        await expect(createKidemTazminatiTfrsEkBilgi({ denetciId: 1, yil: 2025, denetlenenId: 2, oran: 5 })).resolves.toBe(true)
        await expect(createCekSenetReeskontHesapla(1, 2025, 2)).resolves.toEqual(cekSenetPayload)
        await expect(createCekSenetReeskontEkBilgi({ denetciId: 1, yil: 2025, denetlenenId: 2, oran: 5 })).resolves.toBe(true)
        await expect(createBeklenenKrediZarariHesaplanmis(1, 2025, 2, 12, 8)).resolves.toEqual({ success: true, message: '' })
        await expect(createVergiVarligiVeYukumlulugu(1, 2025, 2, 25, 100, 200)).resolves.toBe(true)
        await expect(createVadeliBankaMevduatOtomatikSiniflama({ id: 1 }, true)).resolves.toBe(true)
        await expect(createVadeliBankaMevduatiFaizTahakkuk(1, 2025, 2, { id: 1 }, true)).resolves.toBe(true)
        await expect(createHareketsizTicariAlacak({ id: 1 })).resolves.toBe(true)
        await expect(createHareketsizStok({ id: 1 })).resolves.toBe(true)
        await expect(deleteVadeliBankaMevduatiOtomatikSiniflamaById(4, true)).resolves.toBe(true)
        await expect(deleteHareketsizTicariAlacaklarById(5, true)).resolves.toBe(true)
        await expect(deleteHareketsizStoklarById(6, true)).resolves.toBe(true)
    })

    it('covers raw response and fallback branches', async () => {
        const rawResponse = makeResponse({ ok: false, status: 500, jsonData: { data: [1], warnings: ['uyari'] } })
        mockApiFetch
            .mockResolvedValueOnce(rawResponse)
            .mockResolvedValueOnce(rawResponse)
            .mockResolvedValueOnce(makeResponse({ ok: false, status: 500, jsonData: { data: [1], warnings: ['uyari'] } }))
            .mockRejectedValueOnce(new Error('offline'))

        await expect(createHareketsizTicariAlacaklar(1, 2025, 2, 123)).resolves.toBe(rawResponse)
        await expect(createHareketsizStoklar(1, 2025, 2, 123)).resolves.toBe(rawResponse)
        await expect(getKrediHesaplanmisBakiye(1, 2025, 2)).resolves.toEqual({ data: [], warnings: [] })
        await expect(getKrediHesaplanmisBakiye(1, 2025, 2)).resolves.toEqual({ data: [], warnings: [] })
    })

    it('covers remaining kredi read helpers', async () => {
        const payload = { rows: [1] }
        mockApiFetch.mockResolvedValue(makeResponse({ jsonData: payload }))

        await expect(getKrediHesaplanmis(1, 2025, 2)).resolves.toEqual(payload)
        await expect(getKrediHesaplanmisDetay(1, 2025, 2)).resolves.toEqual(payload)
        await expect(getKrediHesaplanmisOrnekFisler(1, 2025, 2, 'Mizan')).resolves.toEqual(payload)
    })
})
