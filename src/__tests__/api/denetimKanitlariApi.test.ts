import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '@/api/apiBase'
import {
    createOnemlilik,
    createOnemlilikHesaplamaBazi,
    createOrneklem,
    deleteMutabakat,
    getFisIslemSayilari,
    getIliskiliTarafIncelemeHesaplari,
    getMutabakat,
    getMutabakatByDipnot,
    getMutabakatDogrulamaMektubu,
    getOnemlilik,
    getOnemlilikByDipnot,
    getOnemlilikHesaplamaBazi,
    getOnemlilikSeviyesi,
    getOrneklem,
    getOrneklemByDipnot,
    getOrneklemByDipnotTers,
    getOrneklemFisleri,
    getOrneklemFisleriByList,
    getOrneklemFisleriDetay,
    updateMutabakat,
    updateOnemlilik,
    updateOnemlilikHesaplamaBazi,
    updateOrneklem,
} from '@/api/DenetimKanitlari/DenetimKanitlari'

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

describe('DenetimKanitlari API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    it('covers all read endpoints with query-string assertions', async () => {
        const payload = [{ id: 1 }]
        mockApiFetch.mockResolvedValue(makeResponse({ jsonData: payload }))

        await expect(getFisIslemSayilari(1, 2, 2025)).resolves.toEqual(payload)
        await expect(getOrneklem(1, 2, 2025)).resolves.toEqual(payload)
        await expect(getOrneklemByDipnot(1, 2, 2025, '12')).resolves.toEqual(payload)
        await expect(getOrneklemByDipnotTers(1, 2, 2025, '12')).resolves.toEqual(payload)
        await expect(getOrneklemFisleri(1, 2, 2025, 320)).resolves.toEqual(payload)
        await expect(getOrneklemFisleriDetay(1, 2, 2025, 999)).resolves.toEqual(payload)
        await expect(getOnemlilikSeviyesi(1, 2, 2025)).resolves.toEqual(payload)
        await expect(getOnemlilik(1, 2, 2025)).resolves.toEqual(payload)
        await expect(getOnemlilikByDipnot(1, 2, 2025, 'D1')).resolves.toEqual(payload)
        await expect(getOnemlilikHesaplamaBazi(1, 2, 2025)).resolves.toEqual(payload)
        await expect(getMutabakat(1, 2025, 2, 'GR', 'Kasa')).resolves.toEqual(payload)
        await expect(getMutabakatByDipnot(1, 2025, 2, 'D1')).resolves.toEqual(payload)
        await expect(getMutabakatDogrulamaMektubu(1, 2, 2025, 'DET')).resolves.toEqual(payload)
        await expect(getIliskiliTarafIncelemeHesaplari(1, 2, 2025)).resolves.toEqual(payload)

        expect(mockApiFetch).toHaveBeenCalledWith(
            expect.stringContaining('/DenetimKanitlari/OrneklemFisleri?denetciId=1&yil=2025&denetlenenId=2&kebirKodu=320'),
            expect.objectContaining({ method: 'GET' })
        )
        expect(mockApiFetch).toHaveBeenCalledWith(
            expect.stringContaining('/DenetimKanitlari/MutabakatByDipnot?denetciId=1&yil=2025&denetlenenId=2&dipnot=D1'),
            expect.objectContaining({ method: 'GET' })
        )
    })

    it('covers write endpoints and list-based payloads', async () => {
        mockApiFetch.mockResolvedValue(makeResponse({ ok: true, jsonData: { ok: true } }))
        const payload = { id: 44, oran: 10 }

        await expect(createOrneklem(1, 2025, 2, 95, 5, 'TumKayitlar')).resolves.toBe(true)
        await expect(updateOrneklem(payload)).resolves.toBe(true)
        await expect(getOrneklemFisleriByList(1, 2, 2025, [100, 200])).resolves.toEqual({ ok: true })
        await expect(createOnemlilik(1, 2025, 2, 90, 4, 'Secim')).resolves.toBe(true)
        await expect(updateOnemlilik(payload)).resolves.toBe(true)
        await expect(createOnemlilikHesaplamaBazi(1, 2025, 2, payload)).resolves.toBe(true)
        await expect(updateOnemlilikHesaplamaBazi(payload)).resolves.toBe(true)
        await expect(updateMutabakat(payload)).resolves.toBe(true)
        await expect(deleteMutabakat(1, 2, 2025)).resolves.toBe(true)

        expect(mockApiFetch).toHaveBeenCalledWith(
            expect.stringContaining('/DenetimKanitlari/OrneklemFisleriByList?denetciId=1&yil=2025&denetlenenId=2'),
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify([100, 200]),
            })
        )
    })

    it('returns false or undefined for non-success and network failures', async () => {
        mockApiFetch
            .mockResolvedValueOnce(makeResponse({ ok: false, status: 500 }))
            .mockResolvedValueOnce(makeResponse({ ok: false, status: 500 }))
            .mockResolvedValueOnce(makeResponse({ ok: false, status: 500 }))
            .mockRejectedValueOnce(new Error('offline'))

        await expect(createOrneklem(1, 2025, 2, 95, 5, 'TumKayitlar')).resolves.toBe(false)
        await expect(updateMutabakat({})).resolves.toBe(false)
        await expect(deleteMutabakat(1, 2, 2025)).resolves.toBe(false)
        await expect(getFisIslemSayilari(1, 2, 2025)).resolves.toBeUndefined()
    })
})
