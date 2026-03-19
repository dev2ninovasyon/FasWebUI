import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()

vi.mock('@/api/apiBase', () => ({
    apiFetch: apiFetchMock,
}))

vi.mock('@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/VukMizanDonusumMizanKarsilastirma', () => ({}))

describe('Donusum API helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    it('reads dönüşüm and fiş listesi resources', async () => {
        const payload = [{ id: 1 }]
        apiFetchMock.mockResolvedValue({
            ok: true,
            json: async () => payload,
        })

        const {
            getDonusumMizan,
            getOzetDonusumMizan,
            getDonusumMizanKarsilastirma,
            getTersBakiyeVerenProgramVukMizanHesaplari,
            getTersBakiyeVerenDonusumMizanHesaplari,
        } = await import('@/api/Donusum/Donusum')
        const {
            getFisNo,
            getFisListesiVerileri,
            getFisListesiVerileriByFisNo,
            getHazirFisListesiVerileri,
        } = await Promise.all([
            import('@/api/Donusum/FisGirisi'),
            import('@/api/Donusum/FisListesi'),
            import('@/api/Donusum/HazirFisListesi'),
        ]).then(([fisGirisi, fisListesi, hazirFis]) => ({
            ...fisGirisi,
            ...fisListesi,
            ...hazirFis,
        }))

        await expect(getDonusumMizan(2, 2025, true)).resolves.toEqual(payload)
        await expect(getOzetDonusumMizan(2, 2025, false)).resolves.toEqual(payload)
        await expect(getDonusumMizanKarsilastirma(1, 2025, 2, 'VUK')).resolves.toEqual(payload)
        await expect(getTersBakiyeVerenProgramVukMizanHesaplari(2, 2025, false)).resolves.toEqual(payload)
        await expect(getTersBakiyeVerenDonusumMizanHesaplari(2, 2025, true)).resolves.toEqual(payload)
        await expect(getFisNo(1, 2, 2025, true)).resolves.toEqual(payload)
        await expect(getFisListesiVerileri(1, 2, 2025, false)).resolves.toEqual(payload)
        await expect(getFisListesiVerileriByFisNo(1, 2, 2025, 99, true)).resolves.toEqual(payload)
        await expect(getHazirFisListesiVerileri('Bobi')).resolves.toEqual(payload)

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/Donusum/DonusumFisleriByFisNo?denetciId=1&yil=2025&denetlenenId=2&fisNo=99&konsolidasyonMu=true',
            expect.objectContaining({ method: 'GET' })
        )
        expect(apiFetchMock).toHaveBeenCalledWith(
            '/HazirFisler/HazirFisler?denetimTuru=Bobi',
            expect.objectContaining({ method: 'GET' })
        )
    })

    it('writes dönüşüm and fiş updates', async () => {
        apiFetchMock.mockResolvedValue({ ok: true })

        const { DonusumIslemiYap } = await import('@/api/Donusum/Donusum')
        const {
            createFisGirisiVerisi,
        } = await import('@/api/Donusum/FisGirisi')
        const {
            createFisListesiVerisi,
            updateFisListesiVerisi,
            updateFisDurumu,
            deleteFisListesiVerisi,
        } = await import('@/api/Donusum/FisListesi')
        const { createFisListesineHazirFis } = await import('@/api/Donusum/HazirFisListesi')

        await expect(DonusumIslemiYap(1, 2, 2025, 'Bobi', true)).resolves.toBe(true)
        await expect(createFisGirisiVerisi({ id: 1 }, true)).resolves.toBe(true)
        await expect(createFisListesiVerisi(1, 2, 2025, 90, false)).resolves.toBe(true)
        await expect(updateFisListesiVerisi(1, 2, 2025, 7, { durum: 'Yeni' }, true)).resolves.toBe(true)
        await expect(updateFisDurumu(1, 2, 2025, 90, true)).resolves.toBe(true)
        await expect(deleteFisListesiVerisi(1, 2, 2025, [7, 8], false)).resolves.toBe(true)
        await expect(createFisListesineHazirFis(1, 2, 2025, 'Bobi', 4, true)).resolves.toBe(true)

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/Donusum/DonusumFisleri?denetciId=1&yil=2025&denetlenenId=2&id=7&konsolidasyonMu=true',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({ durum: 'Yeni' }),
            })
        )
    })

    it('returns false or undefined on failed dönüşüm calls', async () => {
        apiFetchMock
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('offline'))

        const { DonusumIslemiYap, getDonusumMizan } = await import('@/api/Donusum/Donusum')
        const { updateFisDurumu } = await import('@/api/Donusum/FisListesi')

        await expect(DonusumIslemiYap(1, 2, 2025, 'Bobi', false)).resolves.toBe(false)
        await expect(updateFisDurumu(1, 2, 2025, 90, false)).resolves.toBe(false)
        await expect(getDonusumMizan(2, 2025, false)).resolves.toBeUndefined()
    })
})
