import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Archive from './Archive'
import Language from './Language'
import { renderWithProviders } from '@/test/test-utils'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}))

describe('Header helper components', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        document.body.innerHTML = ''
    })

    it('navigates to archive page from archive shortcut', () => {
        renderWithProviders(<Archive />)

        fireEvent.click(screen.getByLabelText('archive button'))
        expect(pushMock).toHaveBeenCalledWith('/DigerIslemler/Arsiv')
    })

    it('injects gtranslate settings and removes the script on unmount', () => {
        const { unmount } = renderWithProviders(<Language />, {
            preloadedState: {
                customizer: {
                    activeMode: 'light',
                },
            },
        })

        expect(window.gtranslateSettings).toMatchObject({
            default_language: 'tr',
            wrapper_selector: '.gtranslate_wrapper',
        })
        expect(document.querySelector('.gtranslate_wrapper')).toBeInTheDocument()
        expect(document.querySelector('script[src="https://cdn.gtranslate.net/widgets/latest/globe.js"]')).toBeInTheDocument()

        unmount()
        expect(document.querySelector('script[src="https://cdn.gtranslate.net/widgets/latest/globe.js"]')).not.toBeInTheDocument()
    })
})
