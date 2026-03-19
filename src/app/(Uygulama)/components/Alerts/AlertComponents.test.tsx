import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import InfoAlertCart from './InfoAlertCart'
import WarnBox from './WarnBox'
import NoUsersAlert from './NoUsersAlert'
import { renderWithProviders } from '@/test/test-utils'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}))

describe('Alert components', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders info snackbar when cart alert is open', () => {
        renderWithProviders(
            <InfoAlertCart openCartAlert setOpenCartAlert={vi.fn()} />,
            {
                preloadedState: {
                    customizer: {
                        activeMode: 'dark',
                    },
                },
            }
        )

        expect(screen.getByText('İşlem Gerçekleştiriliyor...')).toBeInTheDocument()
    })

    it('expands and collapses warning messages', async () => {
        renderWithProviders(<WarnBox warn={['Ilk uyari', 'Ikinci uyari']} />)

        const warningHeading = screen.getByRole('heading', { name: 'Uyarılar (2)' })
        expect(warningHeading).toBeInTheDocument()

        const collapse = document.querySelector('.MuiCollapse-root')
        expect(collapse).toHaveClass('MuiCollapse-hidden')

        fireEvent.click(warningHeading)
        expect(screen.getByText('- Ilk uyari')).toBeInTheDocument()
        expect(screen.getByText('- Ikinci uyari')).toBeInTheDocument()
        await waitFor(() => {
            expect(collapse).not.toHaveClass('MuiCollapse-hidden')
        })

        fireEvent.click(screen.getByRole('button'))
        await waitFor(() => {
            expect(collapse).toHaveClass('MuiCollapse-hidden')
        })
    })

    it('closes or redirects from no-users dialog', () => {
        const onClose = vi.fn()
        renderWithProviders(<NoUsersAlert open onClose={onClose} />)

        expect(screen.getByText('Kullanıcı Bulunamadı')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Kullanıcı Ekle' }))
        expect(pushMock).toHaveBeenCalledWith('/Kullanici/KullaniciIslemleri/KullaniciEkle')
        expect(onClose).toHaveBeenCalledTimes(1)

        fireEvent.click(screen.getByRole('button', { name: 'Kapat' }))
        expect(onClose).toHaveBeenCalledTimes(2)
    })
})
