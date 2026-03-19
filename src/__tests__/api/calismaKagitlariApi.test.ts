import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()

vi.mock('@/api/apiBase', () => ({
    apiFetch: apiFetchMock,
}))

describe('CalismaKagitlari API helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    it('reads çalışma kağıdı resources across query variants', async () => {
        const payload = [{ id: 1 }]
        apiFetchMock.mockResolvedValue({
            ok: true,
            json: async () => payload,
        })

        const {
            getCalismaKagidiVerileriByDenetciDenetlenenYil,
            getCalismaKagidiVerileriByDenetciDenetlenenYilDipnotNo,
            getCalismaKagidiVerileriByDenetciDenetlenenKullaniciYil,
            getCalismaKagidiVerileriByDenetciDenetlenenYilByKonu,
            getCalismaKagidiVerileriByDenetciDenetlenenYilByUrl,
            getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu,
        } = await import('@/api/CalismaKagitlari/CalismaKagitlari')

        await expect(getCalismaKagidiVerileriByDenetciDenetlenenYil('TestController', 1, 2, 2025)).resolves.toEqual(payload)
        await expect(getCalismaKagidiVerileriByDenetciDenetlenenYilDipnotNo('TestController', 1, 2, 2025, '15')).resolves.toEqual(payload)
        await expect(getCalismaKagidiVerileriByDenetciDenetlenenKullaniciYil('TestController', 1, 2, 3, 2025)).resolves.toEqual(payload)
        await expect(getCalismaKagidiVerileriByDenetciDenetlenenYilByKonu('TestController', 1, 2, 2025, 'risk')).resolves.toEqual(payload)
        await expect(getCalismaKagidiVerileriByDenetciDenetlenenYilByUrl('TestController', 1, 2, 2025, '/form')).resolves.toEqual(payload)
        await expect(getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu(1, 2, 2025, 'A-15')).resolves.toEqual(payload)

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/TestController?denetciId=1&yil=2025&denetlenenId=2&dipnotNo=15',
            expect.objectContaining({ method: 'GET' })
        )
        expect(apiFetchMock).toHaveBeenCalledWith(
            '/FormHazirlayanOnaylayan/1/2025/2/A-15',
            expect.objectContaining({ method: 'GET' })
        )
    })

    it('writes and deletes çalışma kağıdı records', async () => {
        apiFetchMock.mockResolvedValue({ ok: true })

        const {
            createCalismaKagidiVerisi,
            updateCalismaKagidiVerisi,
            updateAllCalismaKagidiVerisi,
            updateOtomatikCalismaKagidiVerisi,
            deleteCalismaKagidiVerisiById,
            deleteAllCalismaKagidiVerileri,
            deleteAllCalismaKagidiVerileriByDipnotNo,
            deleteAllCalismaKagidiVerileriByKullanci,
            deleteAllCalismaKagidiVerileriByKonu,
            deleteAllCalismaKagidiVerileriByUrl,
        } = await import('@/api/CalismaKagitlari/CalismaKagitlari')

        await expect(createCalismaKagidiVerisi('TestController', { id: 1 })).resolves.toBe(true)
        await expect(updateCalismaKagidiVerisi('TestController', 1, { durum: 'ok' })).resolves.toBe(true)
        await expect(updateAllCalismaKagidiVerisi('TestController', [{ id: 1 }])).resolves.toBe(true)
        await expect(updateOtomatikCalismaKagidiVerisi('TestController', 1, 2, 2025)).resolves.toBe(true)
        await expect(deleteCalismaKagidiVerisiById('TestController', 9)).resolves.toBe(true)
        await expect(deleteAllCalismaKagidiVerileri('TestController', 1, 2, 2025)).resolves.toBe(true)
        await expect(deleteAllCalismaKagidiVerileriByDipnotNo('TestController', 1, 2, 2025, '15')).resolves.toBe(true)
        await expect(deleteAllCalismaKagidiVerileriByKullanci('TestController', 1, 2, 3, 2025)).resolves.toBe(true)
        await expect(deleteAllCalismaKagidiVerileriByKonu('TestController', 1, 2, 2025, 'risk')).resolves.toBe(true)
        await expect(deleteAllCalismaKagidiVerileriByUrl('TestController', 1, 2, 2025, '/form')).resolves.toBe(true)

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/TestController/1',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({ durum: 'ok' }),
            })
        )
        expect(apiFetchMock).toHaveBeenCalledWith(
            '/TestController/Hepsi',
            expect.objectContaining({ method: 'PUT' })
        )
    })

    it('maps update and upload error branches', async () => {
        const jsonHeaders = {
            get: vi.fn().mockReturnValue('application/json'),
        }
        const textHeaders = {
            get: vi.fn().mockReturnValue('text/plain'),
        }

        apiFetchMock
            .mockResolvedValueOnce({
                ok: false,
                headers: jsonHeaders,
                json: async () => 'Kayit hatasi',
            })
            .mockResolvedValueOnce({
                ok: false,
                headers: textHeaders,
                text: async () => 'Duzenlenemedi',
            })
            .mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Ek belge yuklenemedi' }),
            })
            .mockRejectedValueOnce(new Error('offline'))

        const {
            updateFormHazirlayanOnaylayan,
            uploadEkBelge,
        } = await import('@/api/CalismaKagitlari/CalismaKagitlari')

        await expect(updateFormHazirlayanOnaylayan(1, { id: 1 }, true)).resolves.toEqual({ message: 'Kayit hatasi' })
        await expect(updateFormHazirlayanOnaylayan(2, { id: 2 }, false)).resolves.toEqual({ message: 'Duzenlenemedi' })
        await expect(uploadEkBelge(new FormData())).resolves.toEqual({
            success: false,
            message: 'Ek belge yuklenemedi',
        })
        await expect(uploadEkBelge(new FormData())).resolves.toEqual({
            success: false,
            message: 'Sunucuya bağlanırken bir hata oluştu.',
        })
    })
})
