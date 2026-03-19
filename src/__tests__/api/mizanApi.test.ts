import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()

vi.mock('@/api/apiBase', () => ({
    apiFetch: apiFetchMock,
}))

describe('Mizan API helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    it('gets mizan rows with the expected query string', async () => {
        const payload = [{ hesapNo: '100', borc: 1500 }]
        apiFetchMock.mockResolvedValue({
            ok: true,
            json: async () => payload,
        })

        const { getMizanVerileri } = await import('@/api/Veri/Mizan')
        const result = await getMizanVerileri(5, 9, 2024, 'TFRS')

        expect(result).toEqual(payload)
        expect(apiFetchMock).toHaveBeenCalledWith(
            '/Mizan/Mizan?denetciId=5&yil=2024&denetlenenId=9&tip=TFRS',
            {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                },
            }
        )
    })

    it('gets filtered and comparison endpoints with their distinct URLs', async () => {
        apiFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ hesapNo: '120' }],
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ satir: 'KVB' }],
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ satir: 'KVB Haric' }],
            })

        const {
            getMizanVerileriByHesapNo,
            getKurumlarVergisiBeyannamesiKarsilastirma,
            getKurumlarVergisiBeyannamesiKarsilastirmaHaric,
        } = await import('@/api/Veri/Mizan')

        await expect(getMizanVerileriByHesapNo(1, 2, 2024, 'BOBI', '120')).resolves.toEqual([
            { hesapNo: '120' },
        ])
        await expect(getKurumlarVergisiBeyannamesiKarsilastirma(1, 2, 2024, 'BOBI')).resolves.toEqual([
            { satir: 'KVB' },
        ])
        await expect(
            getKurumlarVergisiBeyannamesiKarsilastirmaHaric(1, 2, 2024, 'BOBI')
        ).resolves.toEqual([{ satir: 'KVB Haric' }])
    })

    it('creates summary mizan payloads through POST endpoints', async () => {
        apiFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ created: 'ana' }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ created: 'detay' }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ created: 'vuk' }),
            })

        const { createAnaHesapMizan, createDetayHesapMizan, createVukMizan } = await import(
            '@/api/Veri/Mizan'
        )

        await expect(createAnaHesapMizan(1, 2024, 3, '2024-01-01', '2024-12-31')).resolves.toEqual({
            created: 'ana',
        })
        await expect(createDetayHesapMizan(1, 2024, 3, '2024-01-01', '2024-12-31')).resolves.toEqual({
            created: 'detay',
        })
        await expect(createVukMizan(1, 2024, 3, '2024-01-01', '2024-12-31')).resolves.toEqual({
            created: 'vuk',
        })
    })

    it('gets process logs and deletes selected mizan rows', async () => {
        apiFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ id: 6, tip: 'Ana Hesap' }],
            })
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: false })

        const { getMizanBilgileri, deleteMizanBilgisiMultiple } = await import('@/api/Veri/Mizan')

        await expect(getMizanBilgileri(4, 8, 2025, 'TFRS')).resolves.toEqual([{ id: 6, tip: 'Ana Hesap' }])
        await expect(deleteMizanBilgisiMultiple([6, 7])).resolves.toBe(true)
        await expect(deleteMizanBilgisiMultiple([8])).resolves.toBe(false)

        expect(apiFetchMock).toHaveBeenNthCalledWith(2, '/Mizan/MizanIslemLoglari', {
            method: 'DELETE',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([6, 7]),
        })
    })

    it('returns undefined for non-ok creation responses and caught request errors', async () => {
        apiFetchMock
            .mockResolvedValueOnce({ ok: false })
            .mockRejectedValueOnce(new Error('timeout'))

        const { createProgramVukMizan, getProgramVukMizanWithoutType } = await import('@/api/Veri/Mizan')

        await expect(createProgramVukMizan(2, 2026, 4, 'BOBI')).resolves.toBeUndefined()
        await expect(getProgramVukMizanWithoutType(2, 4, 2026)).resolves.toBeUndefined()
    })
})
