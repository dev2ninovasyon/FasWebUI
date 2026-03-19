import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '@/api/apiBase'
import {
    createBulguRiskiBelirleme,
    createFinansalTabloKalemlerindeDegisim,
    createOnemlilikVeOrneklem,
    createOnemlilikVeOrneklemHesaplamaBazi,
    getBulguRiskiBelirleme,
    getFinansalTabloKalemlerindeDegisim,
    getFisBuyukluguAnaliziYillik,
    getOnemlilikVeOrneklem,
    getOnemlilikVeOrneklemHesaplamaBazi,
    getOnemlilikVeOrneklemSeviyesi,
    updateFinansalTabloKalemlerindeDegisim,
    updateOnemlilikVeOrneklem,
    updateOnemlilikVeOrneklemHesaplamaBazi,
    upsertFisBuyukluguAylikNot,
} from '@/api/PlanVeProgram/PlanVeProgram'

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

describe('PlanVeProgram API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    it('covers read endpoints with expected query strings', async () => {
        const payload = { id: 1 }
        mockApiFetch.mockResolvedValue(makeResponse({ jsonData: payload }))

        await expect(getOnemlilikVeOrneklemSeviyesi(3, 7, 2025)).resolves.toEqual(payload)
        await expect(getOnemlilikVeOrneklem(3, 7, 2025)).resolves.toEqual(payload)
        await expect(getOnemlilikVeOrneklemHesaplamaBazi(3, 7, 2025)).resolves.toEqual(payload)
        await expect(getFinansalTabloKalemlerindeDegisim(3, 7, 2025)).resolves.toEqual(payload)
        await expect(getBulguRiskiBelirleme(3, 2025, 7)).resolves.toEqual(payload)
        await expect(getFisBuyukluguAnaliziYillik(3, 2025, 7, true)).resolves.toEqual(payload)

        const calls = mockApiFetch.mock.calls.map(([url, init]) => ({ url, method: init?.method }))
        expect(calls).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ url: expect.stringContaining('/PlanVeProgram/OnemlilikVeOrneklemSeviyesi?denetciId=3&yil=2025&denetlenenId=7'), method: 'GET' }),
                expect.objectContaining({ url: expect.stringContaining('/PlanVeProgram/OnemlilikVeOrneklem?denetciId=3&yil=2025&denetlenenId=7'), method: 'GET' }),
                expect.objectContaining({ url: expect.stringContaining('/PlanVeProgram/OnemlilikVeOrneklemHesaplamaBazi?denetciId=3&yil=2025&denetlenenId=7'), method: 'GET' }),
                expect.objectContaining({ url: expect.stringContaining('/PlanVeProgram/FinansalTabloKalemlerindeDegisim?denetciId=3&yil=2025&denetlenenId=7'), method: 'GET' }),
                expect.objectContaining({ url: expect.stringContaining('/PlanVeProgram/BulguRiskiBelirleme?denetciId=3&yil=2025&denetlenenId=7'), method: 'GET' }),
                expect.objectContaining({ url: expect.stringContaining('/PlanVeProgram/FisBuyukluguAnalizi?denetciId=3&yil=2025&denetlenenId=7'), method: 'GET' }),
            ])
        )
    })

    it('covers write endpoints and serializes payloads correctly', async () => {
        mockApiFetch.mockResolvedValue(makeResponse({ ok: true, jsonData: { saved: true } }))
        const payload = { oran: 12 }

        await expect(createOnemlilikVeOrneklem(3, 2025, 7, 95, 5)).resolves.toBe(true)
        await expect(updateOnemlilikVeOrneklem(payload)).resolves.toBe(true)
        await expect(createOnemlilikVeOrneklemHesaplamaBazi(3, 2025, 7, payload)).resolves.toBe(true)
        await expect(updateOnemlilikVeOrneklemHesaplamaBazi(payload)).resolves.toBe(true)
        await expect(createFinansalTabloKalemlerindeDegisim(3, 2025, 7)).resolves.toBe(true)
        await expect(updateFinansalTabloKalemlerindeDegisim(payload)).resolves.toBe(true)
        await expect(createBulguRiskiBelirleme(3, 2025, 7, 18)).resolves.toBe(true)
        await expect(upsertFisBuyukluguAylikNot(3, 2025, 7, 4, 'Not')).resolves.toEqual({ saved: true })

        expect(mockApiFetch).toHaveBeenCalledWith(
            expect.stringContaining('/PlanVeProgram/OnemlilikVeOrneklem'),
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify(payload),
            })
        )
        expect(mockApiFetch).toHaveBeenLastCalledWith(
            '/PlanVeProgram/UpdateFisBuyukluguAnalizi',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    denetciId: 3,
                    denetlenenId: 7,
                    yil: 2025,
                    ay: 4,
                    not: 'Not',
                }),
            })
        )
    })

    it('returns false or undefined on non-success and caught failures', async () => {
        mockApiFetch
            .mockResolvedValueOnce(makeResponse({ ok: false, status: 500 }))
            .mockResolvedValueOnce(makeResponse({ ok: false, status: 500 }))
            .mockResolvedValueOnce(makeResponse({ ok: false, status: 500 }))
            .mockRejectedValueOnce(new Error('offline'))

        await expect(createOnemlilikVeOrneklem(3, 2025, 7, 95, 5)).resolves.toBe(false)
        await expect(updateOnemlilikVeOrneklem({})).resolves.toBe(false)
        await expect(createBulguRiskiBelirleme(3, 2025, 7, 18)).resolves.toBe(false)
        await expect(getOnemlilikVeOrneklemSeviyesi(3, 7, 2025)).resolves.toBeUndefined()
    })
})
