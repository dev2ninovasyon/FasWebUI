import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import MizanTable from './MizanTable'
import { renderWithProviders } from '@/test/test-utils'
import { deleteMizanBilgisiMultiple, getMizanBilgileri } from '@/api/Veri/Mizan'

vi.mock('@/api/Veri/Mizan', () => ({
    getMizanBilgileri: vi.fn(async () => []),
    deleteMizanBilgisiMultiple: vi.fn(async () => true),
}))

const mizanRows = [
    {
        id: 1,
        tip: 'Çek Senet',
        durum: 'Tamamlandı',
        baslamaZamani: '2026-03-10T10:00:00.000',
        bitisZamani: '2026-03-10T10:02:10.000',
    },
    {
        id: 2,
        tip: 'Mizan Kontrol',
        durum: 'Oluşturuluyor',
        baslamaZamani: '2026-03-10T11:15:00.000',
        bitisZamani: '',
    },
]

describe('MizanTable', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getMizanBilgileri).mockResolvedValue(mizanRows as any)
        vi.mocked(deleteMizanBilgisiMultiple).mockResolvedValue(true as any)
    })

    it('renders fetched rows, formats duration and filters with normalized search', async () => {
        renderWithProviders(<MizanTable type="TFRS" />, {
            preloadedState: {
                userReducer: {
                    denetciId: 12,
                    denetlenenId: 34,
                    yil: 2025,
                },
            },
        })

        expect(await screen.findByText('Çek Senet')).toBeInTheDocument()
        expect(screen.getByText('2 dakika, 10 saniye')).toBeInTheDocument()
        expect(screen.getByText('Devam Ediyor')).toBeInTheDocument()

        fireEvent.change(screen.getByPlaceholderText('Arama'), {
            target: { value: 'cek senet' },
        })

        await waitFor(() => {
            expect(screen.queryByText('Mizan Kontrol')).not.toBeInTheDocument()
        })

        expect(getMizanBilgileri).toHaveBeenCalledWith(12, 34, 2025, 'TFRS')
    })

    it('deletes selected mizan logs after confirmation', async () => {
        renderWithProviders(<MizanTable type="BOBI" />, {
            preloadedState: {
                userReducer: {
                    denetciId: 20,
                    denetlenenId: 40,
                    yil: 2024,
                },
            },
        })

        expect(await screen.findByText('Çek Senet')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Çek Senet'))
        fireEvent.click(screen.getByRole('button', { name: /1 Kayıt Sil/i }))
        fireEvent.click(await screen.findByRole('button', { name: /Evet, Sil/i }))

        await waitFor(() => {
            expect(deleteMizanBilgisiMultiple).toHaveBeenCalledWith([1])
        })
    })
})
