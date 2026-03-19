import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const { replaceMock, authSessionMock } = vi.hoisted(() => ({
    replaceMock: vi.fn(),
    authSessionMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: replaceMock,
    }),
}))

vi.mock('@/contexts/AuthSessionContext', () => ({
    useAuthSession: authSessionMock,
}))

vi.mock('./auth/LoginPageClient', () => ({
    default: () => <div>Login Page Client</div>,
}))

describe('Root Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders loading state while auth status is loading', async () => {
        authSessionMock.mockReturnValue({ status: 'loading' })
        const Page = (await import('./page')).default

        render(<Page />)

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
        expect(screen.queryByText('Login Page Client')).not.toBeInTheDocument()
    })

    it('renders login page for unauthenticated users', async () => {
        authSessionMock.mockReturnValue({ status: 'unauthenticated' })
        const Page = (await import('./page')).default

        render(<Page />)

        await waitFor(() => {
            expect(screen.getByText('Login Page Client')).toBeInTheDocument()
        })
    })

    it('redirects authenticated users to dashboard', async () => {
        authSessionMock.mockReturnValue({ status: 'authenticated' })
        const Page = (await import('./page')).default

        render(<Page />)

        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalledWith('/Anasayfa')
        })
    })
})
