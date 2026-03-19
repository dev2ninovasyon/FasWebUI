import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()

vi.mock('@/api/apiBase', () => ({
    apiFetch: apiFetchMock,
}))

describe('Denetci API helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    it('gets denetci by id with expected request options', async () => {
        const payload = { id: 15, unvan: 'Test Denetci' }
        apiFetchMock.mockResolvedValue({
            ok: true,
            json: async () => payload,
        })

        const { getDenetciById } = await import('@/api/Denetci/Denetci')
        const result = await getDenetciById(15)

        expect(apiFetchMock).toHaveBeenCalledWith('/Denetci/15', {
            method: 'GET',
            headers: {
                accept: 'application/json',
            },
        })
        expect(result).toEqual(payload)
    })

    it('returns true when denetci update succeeds and false when it fails', async () => {
        const { updateDenetci } = await import('@/api/Denetci/Denetci')

        apiFetchMock.mockResolvedValueOnce({ ok: true })
        await expect(updateDenetci(8, { unvan: 'Yeni' })).resolves.toBe(true)

        apiFetchMock.mockResolvedValueOnce({ ok: false })
        await expect(updateDenetci(8, { unvan: 'Yeni' })).resolves.toBe(false)

        expect(apiFetchMock).toHaveBeenNthCalledWith(1, '/Denetci/8', {
            method: 'PUT',
            headers: {
                accept: '*/*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ unvan: 'Yeni' }),
        })
    })

    it('gets odeme bilgileri and kota gecmisi payloads', async () => {
        apiFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ bddkmi: true }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ yil: 2024, kota: 5 }],
            })

        const { getDenetciOdemeBilgileri, getDenetciKotaGecmisi } = await import('@/api/Denetci/Denetci')

        await expect(getDenetciOdemeBilgileri(12)).resolves.toEqual({ bddkmi: true })
        await expect(getDenetciKotaGecmisi(12)).resolves.toEqual([{ yil: 2024, kota: 5 }])

        expect(apiFetchMock).toHaveBeenNthCalledWith(1, '/Denetci/OdemeBilgileri/12', {
            method: 'GET',
            headers: {
                accept: 'application/json',
            },
        })
        expect(apiFetchMock).toHaveBeenNthCalledWith(2, '/Denetci/KotaGecmisi/12', {
            method: 'GET',
            headers: {
                accept: 'application/json',
            },
        })
    })

    it('returns text error message when logo request fails with non-json response', async () => {
        apiFetchMock.mockResolvedValue({
            ok: false,
            headers: {
                get: vi.fn(() => 'text/plain'),
            },
            text: async () => 'Dosya bulunamadı',
        })

        const { getLogo } = await import('@/api/Denetci/Denetci')
        await expect(getLogo(3)).resolves.toEqual({ message: 'Dosya bulunamadı' })
    })

    it('returns json error payload when logo request fails with json response', async () => {
        apiFetchMock.mockResolvedValue({
            ok: false,
            headers: {
                get: vi.fn(() => 'application/json; charset=utf-8'),
            },
            json: async () => 'Logo işlenemedi',
        })

        const { getLogo } = await import('@/api/Denetci/Denetci')
        await expect(getLogo(3)).resolves.toEqual({ message: 'Logo işlenemedi' })
    })

    it('creates logo with form data body and returns status as boolean', async () => {
        const { createLogo } = await import('@/api/Denetci/Denetci')
        const formData = new FormData()
        formData.append('file', new Blob(['logo']), 'logo.png')

        apiFetchMock.mockResolvedValueOnce({ ok: true })
        await expect(createLogo(9, formData)).resolves.toBe(true)

        apiFetchMock.mockResolvedValueOnce({ ok: false })
        await expect(createLogo(9, formData)).resolves.toBe(false)

        expect(apiFetchMock).toHaveBeenNthCalledWith(1, '/Denetci/Logo/9', {
            method: 'POST',
            headers: {},
            body: formData,
        })
    })
})
