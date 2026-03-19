import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()

vi.mock('@/api/apiBase', () => ({
    apiFetch: apiFetchMock,
}))

describe('Simple Veri API helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    it('reads veri resources and forwards payloads', async () => {
        const payload = [{ id: 1 }]
        apiFetchMock.mockResolvedValue({
            ok: true,
            json: async () => payload,
        })

        const amortisman = await import('@/api/Veri/Amortisman')
        const cekSenet = await import('@/api/Veri/CekSenetReeskont')
        const dava = await import('@/api/Veri/DavaKarsiliklari')
        const donusturulmusMizan = await import('@/api/Veri/DonusturulmusMizan')
        const kredi = await import('@/api/Veri/KrediHesaplama')
        const haricFis = await import('@/api/Veri/HaricFisListesi')

        await expect(amortisman.getAmortismanVerileriByDenetciDenetlenenYil(1, 2, 2025)).resolves.toEqual(payload)
        await expect(cekSenet.getCekSenetReeskontVerileriByDenetciDenetlenenYil(1, 2, 2025)).resolves.toEqual(payload)
        await expect(dava.getDavaKarsiliklariVerileriByDenetciDenetlenenYil(1, 2, 2025)).resolves.toEqual(payload)
        await expect(donusturulmusMizan.getDonusturulmusMizanVerileriByDenetciDenetlenenYil(1, 2, 2025)).resolves.toEqual(payload)
        await expect(kredi.getKrediHesaplamaVerileriByDenetciDenetlenenYil(1, 2, 2025)).resolves.toEqual(payload)
        await expect(kredi.getKrediHesaplamaVerileriByDenetciDenetlenenYilId(1, 2, 2025, 9)).resolves.toEqual(payload)
        await expect(haricFis.getYevmiyeFisNo(1, 2, 2025)).resolves.toEqual(payload)
        await expect(haricFis.getStandartYevmiyeFisNo(1, 2, 2025)).resolves.toEqual(payload)
        await expect(haricFis.getStandartYevmiyeFisNoHaric(1, 2, 2025)).resolves.toEqual(payload)
        await expect(haricFis.getFisListesi(1, 2, 2025, '120', '15', '2025-01-01', '2025-12-31', 1, 50, 'ara')).resolves.toEqual(payload)
        await expect(haricFis.getFisListesiHaric(1, 2, 2025, '320', '16', '2025-01-01', '2025-12-31')).resolves.toEqual(payload)
        await expect(haricFis.saveHaricFisListesi(1, 2, 2025, [{ id: 1 }])).resolves.toEqual(payload)
        await expect(haricFis.saveHaricFisListesiHaric(1, 2, 2025, [{ id: 2 }])).resolves.toEqual(payload)
        await expect(haricFis.getYevmiyeFisNoHaric(1, 2, 2025)).resolves.toEqual(payload)

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/EDefter/HaricFisleriGoster',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    denetciId: 1,
                    yil: 2025,
                    denetlenenId: 2,
                    aradonemMi: false,
                    donem: 1,
                    hesapNo: '120',
                    yevmiyeFisNo: '15',
                    baslangicTarihi: '2025-01-01',
                    bitisTarihi: '2025-12-31',
                    page: 1,
                    pageSize: 50,
                    searchTerm: 'ara',
                }),
            })
        )
    })

    it('writes and deletes simple veri records', async () => {
        apiFetchMock.mockResolvedValue({ ok: true })

        const amortisman = await import('@/api/Veri/Amortisman')
        const cekSenet = await import('@/api/Veri/CekSenetReeskont')
        const dava = await import('@/api/Veri/DavaKarsiliklari')
        const donusturulmusMizan = await import('@/api/Veri/DonusturulmusMizan')
        const kredi = await import('@/api/Veri/KrediHesaplama')

        await expect(amortisman.createAmortismanVerisi({ id: 1 })).resolves.toBe(true)
        await expect(amortisman.deleteAmortismanVerisi(1, 2, 2025)).resolves.toBe(true)
        await expect(cekSenet.createCekSenetReeskontVerisi({ id: 2 })).resolves.toBe(true)
        await expect(cekSenet.deleteCekSenetReeskontVerisi(1, 2, 2025)).resolves.toBe(true)
        await expect(dava.createDavaKarsiliklariVerisi({ id: 3 })).resolves.toBe(true)
        await expect(dava.deleteDavaKarsiliklariVerisi(1, 2, 2025)).resolves.toBe(true)
        await expect(donusturulmusMizan.createDonusturulmusMizanVerisi({ id: 4 })).resolves.toBe(true)
        await expect(donusturulmusMizan.deleteDonusturulmusMizanVerisi(1, 2, 2025)).resolves.toBe(true)
        await expect(kredi.createKrediHesaplamaVerisi({ id: 5 })).resolves.toBe(true)
        await expect(kredi.deleteKrediHesaplamaVerisi(1, 2, 2025)).resolves.toBe(true)
    })

    it('returns false or undefined on failed simple veri calls', async () => {
        apiFetchMock
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('offline'))

        const amortisman = await import('@/api/Veri/Amortisman')
        const kredi = await import('@/api/Veri/KrediHesaplama')

        await expect(amortisman.createAmortismanVerisi({ id: 1 })).resolves.toBe(false)
        await expect(kredi.deleteKrediHesaplamaVerisi(1, 2, 2025)).resolves.toBe(false)
        await expect(amortisman.getAmortismanVerileriByDenetciDenetlenenYil(1, 2, 2025)).resolves.toBeUndefined()
    })
})
