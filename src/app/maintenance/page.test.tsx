import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Page from './page'

const { selectorMock, tokenReaderMock } = vi.hoisted(() => ({
    selectorMock: vi.fn(),
    tokenReaderMock: vi.fn(),
}))

vi.mock('@mui/material', async () => {
    const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material')
    return {
        ...actual,
        useMediaQuery: vi.fn(() => false),
    }
})

vi.mock('next/image', () => ({
    default: ({ priority: _priority, ...props }: any) => <img {...props} />,
}))

vi.mock('next/link', () => ({
    default: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}))

vi.mock('@/store/hooks', () => ({
    useSelector: selectorMock,
}))

vi.mock('@/api/apiBase', () => ({
    url: 'http://localhost:5080/api',
}))

vi.mock('@/utils/authSession', () => ({
    readStoredAuthTokens: tokenReaderMock,
}))

describe('Maintenance Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        selectorMock.mockReturnValue({ yetki: '', rol: [], token: '' })
        tokenReaderMock.mockReturnValue({ accessToken: '', refreshToken: '' })
        window.sessionStorage.clear()
    })

    it('shows login action when API is reachable but there is no token', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })))

        render(<Page />)

        await waitFor(() => {
            expect(screen.getByRole('link')).toHaveAttribute('href', '/')
        })
        expect(screen.getByText(/devam edebilirsiniz/i)).toBeInTheDocument()
    })

    it('shows retry action when API is unreachable', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

        render(<Page />)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Yeniden Kontrol Et' })).toBeInTheDocument()
        })
        expect(screen.getAllByText(/ulaşılamıyor/i).length).toBeGreaterThan(0)
    })

    it('shows log screen link for FasAdmin users', async () => {
        selectorMock.mockReturnValue({ yetki: 'FasAdmin', rol: ['FasAdmin'], token: 'abc' })
        tokenReaderMock.mockReturnValue({ accessToken: 'abc', refreshToken: 'def' })
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })))

        render(<Page />)

        await waitFor(() => {
            expect(screen.getByRole('link', { name: 'Log Ekranını Aç' })).toHaveAttribute(
                'href',
                '/DigerIslemler/SistemLoglari'
            )
        })
    })

    it('clears logout reason when login action is clicked', async () => {
        window.sessionStorage.setItem('fas_logout_reason', 'server_expired')
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })))

        render(<Page />)

        const link = await screen.findByRole('link')
        fireEvent.click(link)

        expect(window.sessionStorage.getItem('fas_logout_reason')).toBeNull()
    })
})
