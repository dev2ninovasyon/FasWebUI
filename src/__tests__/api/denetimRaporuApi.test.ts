import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()

vi.mock('@/api/apiBase', () => ({
    apiFetch: apiFetchMock,
}))

describe('DenetimRaporu API helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    it('reads multiple report resources and forwards optional query flags', async () => {
        const payload = [{ id: 1 }]
        apiFetchMock.mockResolvedValue({
            ok: true,
            json: async () => payload,
        })

        const {
            getRaporDipnot,
            getFaaliyetRaporDipnot,
            getRaporGorus,
            getDipnot15Amortisman,
            getDipnot16Maliyet,
            getDipnot25,
            getDipnot34,
            getKrediRiski,
            getDovizKuruRiski,
            getDovizKuruRiskiDuyarlilikAnalizi,
            getDipnotAnaHesaplar,
            getDipnotAnaHesaplarDetay,
        } = await import('@/api/DenetimRaporu/DenetimRaporu')

        await expect(getRaporDipnot(1, 2, 2025, 'Bobi', true)).resolves.toEqual(payload)
        await expect(getFaaliyetRaporDipnot(1, 2, 2025, 'Bobi')).resolves.toEqual(payload)
        await expect(getRaporGorus(1, 2, 2025, 'Bobi', 'Olumlu', false)).resolves.toEqual(payload)
        await expect(getDipnot15Amortisman(1, 2, 2025, true)).resolves.toEqual(payload)
        await expect(getDipnot16Maliyet(1, 2, 2025, false)).resolves.toEqual(payload)
        await expect(getDipnot25(1, 2, 2025, true)).resolves.toEqual(payload)
        await expect(getDipnot34(1, 2, 2025)).resolves.toEqual(payload)
        await expect(getKrediRiski(1, 2, 2025, true)).resolves.toEqual(payload)
        await expect(getDovizKuruRiski(1, 2, 2025, false)).resolves.toEqual(payload)
        await expect(getDovizKuruRiskiDuyarlilikAnalizi(1, 2, 2025, true)).resolves.toEqual(payload)
        await expect(getDipnotAnaHesaplar(1, 2, 2025, 'Bagimsiz', false)).resolves.toEqual(payload)
        await expect(getDipnotAnaHesaplarDetay(1, 2, 2025, 'Bagimsiz')).resolves.toEqual(payload)

        expect(apiFetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/Rapor/RaporDipnot?denetciId=1&denetlenenId=2&yil=2025&tur=Bobi&konsolidasyonMu=true'),
            expect.objectContaining({ method: 'GET' })
        )
        expect(apiFetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/Rapor/TumDipnotHesaplariniGetirRapor?denetciId=1&yil=2025&denetlenenId=2&tur=Bagimsiz&detaymi=true'),
            expect.objectContaining({ method: 'GET' })
        )
    })

    it('updates and deletes report entities through write endpoints', async () => {
        apiFetchMock.mockResolvedValue({ ok: true })

        const {
            updateRaporDipnot,
            updateRaporGorus,
            deleteAllRaporDipnotVerileri,
            updateDipnotMaliyet,
            updateDipnotAmortisman,
            updateKrediRiski,
            updateDovizKuruRiski,
        } = await import('@/api/DenetimRaporu/DenetimRaporu')

        await expect(updateRaporDipnot({ id: 1, metin: 'dipnot' })).resolves.toBe(true)
        await expect(updateRaporGorus({ id: 2, tip: 'Olumlu' })).resolves.toBe(true)
        await expect(deleteAllRaporDipnotVerileri(1, 2, 2025, 'Bagimsiz')).resolves.toBe(true)
        await expect(updateDipnotMaliyet({ id: 3 })).resolves.toBe(true)
        await expect(updateDipnotAmortisman({ id: 4 })).resolves.toBe(true)
        await expect(updateKrediRiski({ id: 5 })).resolves.toBe(true)
        await expect(updateDovizKuruRiski({ id: 6 })).resolves.toBe(true)

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/Rapor/RaporDipnot',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({ id: 1, metin: 'dipnot' }),
            })
        )
        expect(apiFetchMock).toHaveBeenCalledWith(
            '/Rapor/RaporDipnot?denetciId=1&yil=2025&denetlenenId=2&tip=Bagimsiz',
            expect.objectContaining({ method: 'DELETE' })
        )
    })

    it('returns undefined or false on rejected and failed calls', async () => {
        apiFetchMock
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('offline'))

        const {
            getRaporDipnot,
            updateRaporGorus,
            getDipnot25,
        } = await import('@/api/DenetimRaporu/DenetimRaporu')

        await expect(getRaporDipnot(1, 2, 2025, 'Bobi')).resolves.toBeUndefined()
        await expect(updateRaporGorus({ id: 9 })).resolves.toBe(false)
        await expect(getDipnot25(1, 2, 2025)).resolves.toBeUndefined()
    })
})
