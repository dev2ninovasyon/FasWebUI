import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()

vi.mock('@/api/apiBase', () => ({
    apiFetch: apiFetchMock,
    url: 'http://localhost:5000/api',
}))

describe('Misc API helper modules', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    it('covers analytics and archive endpoints', async () => {
        const payload = [{ id: 1 }]
        apiFetchMock.mockResolvedValue({
            ok: true,
            json: async () => payload,
        })

        const analizler = await import('@/api/Analizler/Analizler')
        const arsiv = await import('@/api/Arsiv/Arsiv')
        const anaSayfa = await import('@/api/AnaSayfa/AnaSayfa')

        await expect(analizler.createKarsilastirmaliAnaliz(1, 2025, 2)).resolves.toBe(true)
        await expect(analizler.getKarsilastirmaliAnaliz(1, 2025, 2)).resolves.toEqual(payload)
        await expect(analizler.createDikeyAnaliz(1, 2025, 2)).resolves.toBe(true)
        await expect(analizler.getDikeyAnaliz(1, 2025, 2)).resolves.toEqual(payload)
        await expect(analizler.getDikeyAnalizFinansalDurum(1, 2025, 2)).resolves.toEqual(payload)
        await expect(analizler.getDikeyAnalizTablosuKarZarar(1, 2025, 2)).resolves.toEqual(payload)

        await expect(arsiv.getArsivTumu(1, 2)).resolves.toEqual(payload)
        await expect(arsiv.getArsiv(1, 2025, 2)).resolves.toEqual(payload)
        await expect(arsiv.deleteArsiv('folder/a')).resolves.toBe(true)
        await expect(arsiv.deleteAllArsiv(['a', 'b'])).resolves.toBe(true)

        await expect(anaSayfa.getUserRecentActions(7, 2, 2025, 5)).resolves.toEqual(payload)
        await expect(anaSayfa.getSirketArsivOzet(7, 1)).resolves.toEqual(payload)

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/ArsivIslemleri/SilToplu?',
            expect.objectContaining({
                method: 'DELETE',
                body: JSON.stringify(['a', 'b']),
            })
        )
    })

    it('covers kullanıcı and kullanıcı ayarları flows including error branches', async () => {
        apiFetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1 }] })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) })
            .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2 }] })
            .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 3 }] })
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ tema: 'light' }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
            .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'failed' })
            .mockRejectedValueOnce(new Error('offline'))
            .mockRejectedValueOnce(new Error('offline'))

        const kullanici = await import('@/api/Kullanici/KullaniciIslemleri')
        const ayarlar = await import('@/api/Kullanici/KullaniciAyarlar')

        await expect(kullanici.getKullanicilar()).resolves.toEqual([{ id: 1 }])
        await expect(kullanici.getKullaniciById(1)).resolves.toEqual({ id: 1 })
        await expect(kullanici.getKullaniciByDenetciId(8)).resolves.toEqual([{ id: 2 }])
        await expect(kullanici.getKullaniciByDenetlenenYilRol(55, 2025, 'Denetci')).resolves.toEqual([{ id: 3 }])
        await expect(kullanici.createKullanici({ ad: 'Ali' })).resolves.toBe(true)
        await expect(kullanici.updateKullanici(1, { ad: 'Veli' })).resolves.toBe(true)
        await expect(kullanici.updatekullaniciSifre(1, { sifre: '123' })).resolves.toBe(true)
        await expect(kullanici.deleteKullaniciById(1)).resolves.toBe(true)

        await expect(ayarlar.getKullaniciAyarlar(7)).resolves.toEqual({ tema: 'light' })
        await expect(ayarlar.updateKullaniciAyarlar(7, { tema: 'dark' })).resolves.toEqual({ ok: true })
        await expect(ayarlar.updateKurulumAyarlari(7, true, 3, '75')).resolves.toEqual({ ok: true })
        await expect(ayarlar.updateSonSecilenAyarlari(7, 55, 2025)).rejects.toThrow('Update failed: 500')
        await expect(ayarlar.updateTurTamamlandi(7, true)).rejects.toThrow('offline')
        await expect(ayarlar.updateKullaniciAyarlar(7, { tema: 'blue' })).rejects.toThrow('offline')

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/KullaniciAyarlar/SonSecilen/7',
            expect.objectContaining({
                method: 'PUT',
                ignoreCustomHeaders: true,
                body: JSON.stringify({ denetlenenId: 55, yil: 2025 }),
            })
        )
    })

    it('returns safe fallback values on failed list reads', async () => {
        apiFetchMock
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })

        const arsiv = await import('@/api/Arsiv/Arsiv')
        const kullanici = await import('@/api/Kullanici/KullaniciIslemleri')
        const ayarlar = await import('@/api/Kullanici/KullaniciAyarlar')

        await expect(arsiv.getArsivTumu(1, 2)).resolves.toBeUndefined()
        await expect(kullanici.getKullanicilar()).resolves.toBeUndefined()
        await expect(ayarlar.getKullaniciAyarlar(7)).resolves.toBeNull()
    })
})
