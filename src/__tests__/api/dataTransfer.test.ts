import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()

vi.mock('@/api/apiBase', () => ({
    apiFetch: apiFetchMock,
}))

describe('DataTransfer API helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('returns old customers and falls back to an empty array on HTTP errors', async () => {
        apiFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ id: 1, firmaAdi: 'Eski Musteri' }],
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 503,
            })

        const { getMigrationOldCustomers } = await import('@/api/DataTransfer/DataTransfer')

        await expect(getMigrationOldCustomers()).resolves.toEqual([{ id: 1, firmaAdi: 'Eski Musteri' }])
        await expect(getMigrationOldCustomers()).resolves.toEqual([])

        expect(apiFetchMock).toHaveBeenNthCalledWith(1, '/migration/old-customers', {
            method: 'GET',
        })
    })

    it('posts migration body and throws the backend text when migration fails', async () => {
        apiFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ basarili: true, mesaj: 'Tamam' }),
            })
            .mockResolvedValueOnce({
                ok: false,
                text: async () => 'Tasima basarisiz',
            })

        const { migrateCustomer } = await import('@/api/DataTransfer/DataTransfer')

        await expect(
            migrateCustomer({
                oldCustomerId: 77,
                year: 2024,
            })
        ).resolves.toEqual({ basarili: true, mesaj: 'Tamam' })

        await expect(
            migrateCustomer({
                oldCustomerId: 88,
                year: 2025,
            })
        ).rejects.toThrow('Tasima basarisiz')

        expect(apiFetchMock).toHaveBeenNthCalledWith(1, '/migration/migrate-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                oldCustomerId: 77,
                year: 2024,
            }),
        })
    })

    it('maps old auditor payloads with PascalCase fields into the UI shape', async () => {
        apiFetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => [
                {
                    id: 4,
                    FirmaAdi: 'Acme',
                    FirmaUnvani: 'Acme Bagimsiz Denetim',
                    VergiNo: '123',
                    VergiDairesi: 'Kadikoy',
                    Il: 'Istanbul',
                    Adres: 'Merkez',
                    Tel: '555',
                    Email: 'mail@test.com',
                    TicaretSicilNo: 'TS1',
                    Aktifmi: true,
                },
            ],
        })

        const { getOldDbDenetciler } = await import('@/api/DataTransfer/DataTransfer')
        const result = await getOldDbDenetciler()

        expect(result).toEqual([
            expect.objectContaining({
                id: 4,
                firmaAdi: 'Acme',
                firmaUnvani: 'Acme Bagimsiz Denetim',
                vergiNo: '123',
                vergiDairesi: 'Kadikoy',
                il: 'Istanbul',
                adres: 'Merkez',
                tel: '555',
                email: 'mail@test.com',
                ticaretSicilNo: 'TS1',
                aktifmi: true,
            }),
        ])
        expect(apiFetchMock).toHaveBeenCalledWith('/DataTransfer/Denetciler', {
            method: 'GET',
            ignoreCustomHeaders: false,
            credentials: 'omit',
        })
    })

    it('returns empty arrays for public list endpoints when the request throws', async () => {
        apiFetchMock.mockRejectedValue(new Error('network down'))

        const { getOldDbCompanies, getOldDbCompanyYears, getDataTransferTables } = await import(
            '@/api/DataTransfer/DataTransfer'
        )

        await expect(getOldDbCompanies()).resolves.toEqual([])
        await expect(getOldDbCompanyYears(15)).resolves.toEqual([])
        await expect(getDataTransferTables()).resolves.toEqual([])
    })
})
