import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()

vi.mock('@/api/apiBase', () => ({
    apiFetch: apiFetchMock,
}))

describe('Coverage boost API helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('covers DosyaBilgileri helpers for success, failure and catch paths', async () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const {
            getDosyaBilgileri,
            deleteDosyaBilgisiById,
            deleteDosyaBilgisiMultiple,
            getDefterYuklemeLoglari,
        } = await import('@/api/Dosya/DosyaBilgileri')

        apiFetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1 }] })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true, json: async () => 'ok-log' })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))

        await expect(getDosyaBilgileri(1, 2, 2025, 'tip')).resolves.toEqual([{ id: 1 }])
        await expect(getDosyaBilgileri(1, 2, 2025, 'tip')).resolves.toBeUndefined()
        await expect(getDosyaBilgileri(1, 2, 2025, 'tip')).resolves.toBeUndefined()

        await expect(deleteDosyaBilgisiById(7)).resolves.toBe(true)
        await expect(deleteDosyaBilgisiById(7)).resolves.toBe(false)
        await expect(deleteDosyaBilgisiById(7)).resolves.toBeUndefined()

        await expect(deleteDosyaBilgisiMultiple([1, 2])).resolves.toBe(true)
        await expect(deleteDosyaBilgisiMultiple([1, 2])).resolves.toBe(false)
        await expect(deleteDosyaBilgisiMultiple([1, 2])).resolves.toBeUndefined()

        await expect(getDefterYuklemeLoglari(55)).resolves.toBe('ok-log')
        await expect(getDefterYuklemeLoglari(55)).resolves.toBeUndefined()
        await expect(getDefterYuklemeLoglari(55)).resolves.toBeUndefined()

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/Veri/DosyaBilgileri?denetciId=1&yil=2025&denetlenenId=2&tip=tip',
            expect.objectContaining({ method: 'GET' })
        )
        expect(logSpy).toHaveBeenCalled()
    })

    it('covers Konsolidasyon helpers', async () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const {
            getTanimlamalar,
            getTanimlamalarById,
            updateTanimlamalar,
            createBirlestirilmisMizan,
        } = await import('@/api/Konsolidasyon/Konsolidasyon')

        apiFetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 't1' }] })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 't2' }) })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'mizan' }) })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))

        await expect(getTanimlamalar(8, 2025, 99)).resolves.toEqual([{ id: 't1' }])
        await expect(getTanimlamalar(8, 2025, 99)).resolves.toBeUndefined()
        await expect(getTanimlamalar(8, 2025, 99)).resolves.toBeUndefined()

        await expect(getTanimlamalarById(4)).resolves.toEqual({ id: 't2' })
        await expect(getTanimlamalarById(4)).resolves.toBeUndefined()
        await expect(getTanimlamalarById(4)).resolves.toBeUndefined()

        await expect(updateTanimlamalar(4, { name: 'x' })).resolves.toBe(true)
        await expect(updateTanimlamalar(4, { name: 'x' })).resolves.toBe(false)
        await expect(updateTanimlamalar(4, { name: 'x' })).resolves.toBeUndefined()

        await expect(createBirlestirilmisMizan(8, 2025, 99)).resolves.toEqual({ id: 'mizan' })
        await expect(createBirlestirilmisMizan(8, 2025, 99)).resolves.toBeUndefined()
        await expect(createBirlestirilmisMizan(8, 2025, 99)).resolves.toBeUndefined()

        expect(logSpy).toHaveBeenCalled()
    })

    it('covers AnaSayfa and Arsiv helpers', async () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const { getUserRecentActions, getSirketArsivOzet } = await import('@/api/AnaSayfa/AnaSayfa')
        const { getArsivTumu, getArsiv, deleteArsiv, deleteAllArsiv } = await import('@/api/Arsiv/Arsiv')

        apiFetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1 }] })
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ toplamSirketSayisi: 2 }) })
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: true, json: async () => ['tum'] })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true, json: async () => ['arsiv'] })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))

        await expect(getUserRecentActions(1, 2, 2025, 10)).resolves.toEqual([{ id: 1 }])
        await expect(getUserRecentActions(1, 2, 2025, 10)).rejects.toThrow('Son işlemler alınırken hata oluştu.')

        await expect(getSirketArsivOzet(3, 4)).resolves.toEqual({ toplamSirketSayisi: 2 })
        await expect(getSirketArsivOzet(3, 4)).rejects.toThrow('Şirket arşiv özeti alınamadı.')

        await expect(getArsivTumu(1, 2)).resolves.toEqual(['tum'])
        await expect(getArsivTumu(1, 2)).resolves.toBeUndefined()
        await expect(getArsivTumu(1, 2)).resolves.toBeUndefined()

        await expect(getArsiv(1, 2025, 2)).resolves.toEqual(['arsiv'])
        await expect(getArsiv(1, 2025, 2)).resolves.toBeUndefined()
        await expect(getArsiv(1, 2025, 2)).resolves.toBeUndefined()

        await expect(deleteArsiv('x')).resolves.toBe(true)
        await expect(deleteArsiv('x')).resolves.toBe(false)
        await expect(deleteArsiv('x')).resolves.toBeUndefined()

        await expect(deleteAllArsiv(['a', 'b'])).resolves.toBe(true)
        await expect(deleteAllArsiv(['a', 'b'])).resolves.toBe(false)
        await expect(deleteAllArsiv(['a', 'b'])).resolves.toBeUndefined()

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/Audit/UserRecentActions?userId=1&count=10&denetlenenId=2&yil=2025',
            expect.objectContaining({ method: 'GET', cache: 'no-store' })
        )
        expect(logSpy).toHaveBeenCalled()
    })

    it('covers FinansalTablolar helpers', async () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const {
            getFinansalDurumTablosu,
            getKarZararTablosu,
            getNakitAkisTablosu,
            getOzkaynakTablosu,
            FinansalTabloOlustur,
        } = await import('@/api/FinansalTablolar/FinansalToblolar')

        apiFetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => ({ rows: [1] }) })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true, json: async () => ({ rows: [2] }) })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true, json: async () => ({ rows: [3] }) })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true, json: async () => ({ rows: [4] }) })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))

        await expect(getFinansalDurumTablosu(1, 2025, 2, true)).resolves.toEqual({ rows: [1] })
        await expect(getFinansalDurumTablosu(1, 2025, 2)).resolves.toBeUndefined()
        await expect(getFinansalDurumTablosu(1, 2025, 2)).resolves.toBeUndefined()

        await expect(getKarZararTablosu(1, 2025, 2)).resolves.toEqual({ rows: [2] })
        await expect(getKarZararTablosu(1, 2025, 2)).resolves.toBeUndefined()
        await expect(getKarZararTablosu(1, 2025, 2)).resolves.toBeUndefined()

        await expect(getNakitAkisTablosu(1, 2025, 2)).resolves.toEqual({ rows: [3] })
        await expect(getNakitAkisTablosu(1, 2025, 2)).resolves.toBeUndefined()
        await expect(getNakitAkisTablosu(1, 2025, 2)).resolves.toBeUndefined()

        await expect(getOzkaynakTablosu(1, 2025, 2)).resolves.toEqual({ rows: [4] })
        await expect(getOzkaynakTablosu(1, 2025, 2)).resolves.toBeUndefined()
        await expect(getOzkaynakTablosu(1, 2025, 2)).resolves.toBeUndefined()

        await expect(FinansalTabloOlustur(1, 2, 2025, 'Direkt', true)).resolves.toBe(true)
        await expect(FinansalTabloOlustur(1, 2, 2025, 'Direkt')).resolves.toBe(false)
        await expect(FinansalTabloOlustur(1, 2, 2025, 'Direkt')).resolves.toBeUndefined()

        expect(logSpy).toHaveBeenCalled()
    })

    it('covers DataTransfer helpers', async () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const {
            getMigrationOldCustomers,
            migrateCustomer,
            getOldDbDenetciler,
            getOldDbCompanies,
            getOldDbCompanyYears,
            getDataTransferTables,
        } = await import('@/api/DataTransfer/DataTransfer')

        apiFetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1 }] })
            .mockResolvedValueOnce({ ok: false, status: 500 })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true, json: async () => ({ basarili: true }) })
            .mockResolvedValueOnce({ ok: false, text: async () => 'bad-request' })
            .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'ERR', text: async () => 'boom' })
            .mockResolvedValueOnce({ ok: true, json: async () => [{ FirmaAdi: 'A', Aktifmi: true }] })
            .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'ERR', text: async () => 'boom' })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'c1' }] })
            .mockResolvedValueOnce({ ok: false, status: 404, statusText: 'NF' })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true, json: async () => [2024, 2025] })
            .mockResolvedValueOnce({ ok: false, status: 404, statusText: 'NF' })
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({ ok: true, json: async () => [{ name: 't1' }] })
            .mockResolvedValueOnce({ ok: false, status: 404, statusText: 'NF' })
            .mockRejectedValueOnce(new Error('network'))

        await expect(getMigrationOldCustomers()).resolves.toEqual([{ id: 1 }])
        await expect(getMigrationOldCustomers()).resolves.toEqual([])
        await expect(getMigrationOldCustomers()).resolves.toEqual([])

        await expect(migrateCustomer({ oldCustomerId: 1, year: 2025 })).resolves.toEqual({ basarili: true })
        await expect(migrateCustomer({ oldCustomerId: 1, year: 2025 })).rejects.toThrow('bad-request')
        await expect(migrateCustomer({ oldCustomerId: 1, year: 2025 })).rejects.toThrow('boom')

        await expect(getOldDbDenetciler()).resolves.toEqual([
            expect.objectContaining({ firmaAdi: 'A', aktifmi: true }),
        ])
        await expect(getOldDbDenetciler()).resolves.toEqual([])
        await expect(getOldDbDenetciler()).resolves.toEqual([])

        await expect(getOldDbCompanies()).resolves.toEqual([{ id: 'c1' }])
        await expect(getOldDbCompanies()).resolves.toEqual([])
        await expect(getOldDbCompanies()).resolves.toEqual([])

        await expect(getOldDbCompanyYears(7)).resolves.toEqual([2024, 2025])
        await expect(getOldDbCompanyYears(7)).resolves.toEqual([])
        await expect(getOldDbCompanyYears(7)).resolves.toEqual([])

        await expect(getDataTransferTables()).resolves.toEqual([{ name: 't1' }])
        await expect(getDataTransferTables()).resolves.toEqual([])
        await expect(getDataTransferTables()).resolves.toEqual([])

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/migration/migrate-customer',
            expect.objectContaining({ method: 'POST' })
        )
        expect(logSpy).toHaveBeenCalled()
        expect(errorSpy).toHaveBeenCalled()
    })

    it('covers Enflasyon helpers', async () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const { getEnflasyonDetayMizan } = await import('@/api/Enflasyon/DetayMizan')
        const { createFisGirisiVerisi, getFisNo } = await import('@/api/Enflasyon/FisGirisi')
        const {
            getFisListesiVerileri,
            getFisListesiVerileriByFisNo,
            createFisListesiVerisi,
            updateFisListesiVerisi,
            updateFisDurumu,
            deleteFisListesiVerisi,
        } = await import('@/api/Enflasyon/FisIslemleri')

        apiFetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'detay' }] })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))

        await expect(getEnflasyonDetayMizan(2, 2025)).resolves.toEqual([{ id: 'detay' }])
        await expect(getEnflasyonDetayMizan(2, 2025)).resolves.toEqual([])
        await expect(getEnflasyonDetayMizan(2, 2025)).resolves.toEqual([])

        apiFetchMock.mockReset()
        apiFetchMock
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))

        await expect(createFisGirisiVerisi({ id: 1 }, false)).resolves.toBe(true)
        await expect(createFisGirisiVerisi({ id: 1 }, false)).resolves.toBe(false)
        await expect(createFisGirisiVerisi({ id: 1 }, false)).resolves.toBeUndefined()

        apiFetchMock.mockReset()
        apiFetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => ({ fisNo: 11 }) })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))

        await expect(getFisNo(1, 2, 2025, false)).resolves.toEqual({ fisNo: 11 })
        await expect(getFisNo(1, 2, 2025, false)).resolves.toBeUndefined()
        await expect(getFisNo(1, 2, 2025, false)).resolves.toBeUndefined()

        apiFetchMock.mockReset()
        apiFetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1 }] })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))

        await expect(getFisListesiVerileri(1, 2, 2025, false)).resolves.toEqual([{ id: 1 }])
        await expect(getFisListesiVerileri(1, 2, 2025, false)).resolves.toBeUndefined()
        await expect(getFisListesiVerileri(1, 2, 2025, false)).resolves.toBeUndefined()

        apiFetchMock.mockReset()
        apiFetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2 }] })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))

        await expect(getFisListesiVerileriByFisNo(1, 2, 2025, 99, false)).resolves.toEqual([{ id: 2 }])
        await expect(getFisListesiVerileriByFisNo(1, 2, 2025, 99, false)).resolves.toBeUndefined()
        await expect(getFisListesiVerileriByFisNo(1, 2, 2025, 99, false)).resolves.toBeUndefined()

        apiFetchMock.mockReset()
        apiFetchMock
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))

        await expect(createFisListesiVerisi(1, 2, 2025, 8, false)).resolves.toBe(true)
        await expect(createFisListesiVerisi(1, 2, 2025, 8, false)).resolves.toBe(false)
        await expect(createFisListesiVerisi(1, 2, 2025, 8, false)).resolves.toBeUndefined()

        apiFetchMock.mockReset()
        apiFetchMock
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))

        await expect(updateFisListesiVerisi(1, 2, 2025, 3, { a: 1 }, false)).resolves.toBe(true)
        await expect(updateFisListesiVerisi(1, 2, 2025, 3, { a: 1 }, false)).resolves.toBe(false)
        await expect(updateFisListesiVerisi(1, 2, 2025, 3, { a: 1 }, false)).resolves.toBeUndefined()

        apiFetchMock.mockReset()
        apiFetchMock
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))

        await expect(updateFisDurumu(1, 2, 2025, 8, false)).resolves.toBe(true)
        await expect(updateFisDurumu(1, 2, 2025, 8, false)).resolves.toBe(false)
        await expect(updateFisDurumu(1, 2, 2025, 8, false)).resolves.toBeUndefined()

        apiFetchMock.mockReset()
        apiFetchMock
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('network'))

        await expect(deleteFisListesiVerisi(1, 2, 2025, [1, 2], false)).resolves.toBe(true)
        await expect(deleteFisListesiVerisi(1, 2, 2025, [1, 2], false)).resolves.toBe(false)
        await expect(deleteFisListesiVerisi(1, 2, 2025, [1, 2], false)).resolves.toBeUndefined()

        expect(logSpy).toHaveBeenCalled()
    })
})
