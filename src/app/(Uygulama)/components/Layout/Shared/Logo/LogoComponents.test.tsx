import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Logo from './Logo'
import MobileLogo from './MobileLogo'
import CollapseLogo from './CollapsLogo'
import { renderWithProviders } from '@/test/test-utils'

const setLoadingMock = vi.fn()

vi.mock('@/contexts/LoadingContext', () => ({
    useLoading: () => ({
        setLoading: setLoadingMock,
    }),
}))

vi.mock('next/image', () => ({
    default: ({ priority: _priority, ...props }: any) => <img {...props} />,
}))

vi.mock('next/link', () => ({
    default: ({ href, onClick, children }: any) => (
        <a href={href} onClick={onClick}>
            {children}
        </a>
    ),
}))

describe('Logo components', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders desktop logo and triggers loading state on click', () => {
        renderWithProviders(<Logo />, {
            preloadedState: {
                customizer: {
                    activeDir: 'ltr',
                    activeMode: 'light',
                    TopbarHeight: 64,
                },
            },
        })

        const logo = screen.getByAltText('logo')
        expect(logo).toHaveAttribute('src', '/images/logos/fas-logo-yazili-siyah.png')

        fireEvent.click(logo.closest('a')!)
        expect(setLoadingMock).toHaveBeenCalledWith(true)
    })

    it('renders mobile logo with dark mode asset', () => {
        renderWithProviders(<MobileLogo />, {
            preloadedState: {
                customizer: {
                    activeDir: 'rtl',
                    activeMode: 'dark',
                    TopbarHeight: 72,
                },
            },
        })

        expect(screen.getByAltText('logo')).toHaveAttribute('src', '/images/logos/fas-logo-yazili-beyaz.png')
    })

    it('renders collapsed logo and preserves navigation target', () => {
        renderWithProviders(<CollapseLogo />, {
            preloadedState: {
                customizer: {
                    activeDir: 'ltr',
                    activeMode: 'light',
                    TopbarHeight: 64,
                    isCollapse: true,
                },
            },
        })

        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', '/Anasayfa')
        expect(screen.getByAltText('logo')).toHaveAttribute('src', '/images/logos/fas-logov1.png')
    })
})
