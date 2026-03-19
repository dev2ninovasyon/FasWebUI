import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Profile from '@/app/(Uygulama)/components/Layout/Vertical/Header/Profile/Profile'
import { apiFetch } from '@/api/apiBase'

vi.mock('next/navigation', () => ({
    usePathname: vi.fn(() => '/dashboard'),
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    })),
}))

vi.mock('../../../app/(Uygulama)/components/Layout/Vertical/Header/Profile/ProfileItems', () => ({
    default: () => <div data-testid="mock-profile-items">Mock Profile Items</div>,
}))

vi.mock('@/api/apiBase', () => ({
    apiFetch: vi.fn(),
}))

vi.mock('@/store/user/UserSlice', () => ({
    __esModule: true,
    default: vi.fn(() => ({})),
    resetToNull: vi.fn((payload) => ({ type: 'user/resetToNull', payload })),
}))

describe('Profile Component', () => {
    let store: any

    beforeEach(() => {
        vi.clearAllMocks()

        store = configureStore({
            reducer: {
                userReducer: () => ({
                    kullaniciAdi: 'Test User',
                    yetki: 'Admin',
                    mail: 'test@example.com',
                    unvan: 'Developer',
                }),
                customizer: () => ({
                    avatarSrc: '/images/profile/user-1.jpg',
                }),
            },
        })
    })

    it('should render profile button with avatar', () => {
        render(
            <Provider store={store}>
                <Profile />
            </Provider>
        )

        expect(screen.getByAltText('ProfileImg')).toBeInTheDocument()
    })

    it('should open popover when profile button is clicked', async () => {
        render(
            <Provider store={store}>
                <Profile />
            </Provider>
        )

        fireEvent.click(screen.getByLabelText('show 11 new notifications'))

        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument()
            expect(screen.getByText('Admin')).toBeInTheDocument()
            expect(screen.getByText('test@example.com')).toBeInTheDocument()
        })
    })

    it('should display logout button in popover', async () => {
        render(
            <Provider store={store}>
                <Profile />
            </Provider>
        )

        fireEvent.click(screen.getByLabelText('show 11 new notifications'))

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /\u00c7\u0131k\u0131\u015f/i })).toBeInTheDocument()
        })
    })

    it('should close popover when clicking outside', async () => {
        render(
            <Provider store={store}>
                <Profile />
            </Provider>
        )

        fireEvent.click(screen.getByLabelText('show 11 new notifications'))

        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument()
        })

        const backdrop = document.querySelector('.MuiBackdrop-root')
        if (backdrop) {
            fireEvent.click(backdrop)
        } else {
            fireEvent.keyDown(document, { key: 'Escape' })
        }

        await waitFor(() => {
            const userInfo = screen.queryByText('Test User')
            if (userInfo) {
                expect(userInfo).not.toBeVisible()
                return
            }

            expect(userInfo).toBeNull()
        }, { timeout: 2000 })
    })

    it('should format yetki correctly when camelCase', async () => {
        store = configureStore({
            reducer: {
                userReducer: () => ({
                    kullaniciAdi: 'Test User',
                    yetki: 'Ba\u015fDenet\u00e7i',
                    mail: 'test@example.com',
                }),
                customizer: () => ({
                    avatarSrc: '',
                }),
            },
        })

        render(
            <Provider store={store}>
                <Profile />
            </Provider>
        )

        fireEvent.click(screen.getByLabelText('show 11 new notifications'))

        await waitFor(() => {
            expect(screen.getByText(/Ba\u015f Denet\u00e7i/i)).toBeInTheDocument()
        })
    })

    it('should clear persisted auth state and call logout endpoint', async () => {
        vi.mocked(apiFetch).mockResolvedValue({ ok: true } as any)

        window.localStorage.setItem('persist:root', 'persisted')
        window.localStorage.setItem('fas_token', 'token')
        window.localStorage.setItem('fas_refreshToken', 'refresh')
        window.localStorage.setItem('fas_denetlenenId', '1')
        window.localStorage.setItem('fas_yil', '2025')
        window.localStorage.setItem('fas_blacklisted_tokens', '[]')
        window.sessionStorage.setItem('reduxState', 'state')
        window.sessionStorage.setItem('fas_debug_no_login_redirect', '1')
        window.sessionStorage.setItem('fas_token', 'session-token')
        window.sessionStorage.setItem('fas_refreshToken', 'session-refresh')
        window.sessionStorage.setItem('fas_session_token', 'session-token-2')
        window.sessionStorage.setItem('fas_session_refreshToken', 'session-refresh-2')

        render(
            <Provider store={store}>
                <Profile />
            </Provider>
        )

        fireEvent.click(screen.getByLabelText('show 11 new notifications'))

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /\u00c7\u0131k\u0131\u015f/i })).toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole('button', { name: /\u00c7\u0131k\u0131\u015f/i }))

        await waitFor(() => {
            expect(apiFetch).toHaveBeenCalledWith('/Auth/logout', {
                method: 'POST',
                suppressErrorLog: true,
            })
        })

        expect(window.localStorage.getItem('persist:root')).toBeNull()
        expect(window.localStorage.getItem('fas_token')).toBeNull()
        expect(window.localStorage.getItem('fas_refreshToken')).toBeNull()
        expect(window.localStorage.getItem('fas_denetlenenId')).toBeNull()
        expect(window.localStorage.getItem('fas_yil')).toBeNull()
        expect(window.localStorage.getItem('fas_blacklisted_tokens')).toBeNull()
        expect(window.sessionStorage.getItem('reduxState')).toBeNull()
        expect(window.sessionStorage.getItem('fas_debug_no_login_redirect')).toBeNull()
        expect(window.sessionStorage.getItem('fas_token')).toBeNull()
        expect(window.sessionStorage.getItem('fas_refreshToken')).toBeNull()
        expect(window.sessionStorage.getItem('fas_session_token')).toBeNull()
        expect(window.sessionStorage.getItem('fas_session_refreshToken')).toBeNull()
        expect(window.sessionStorage.getItem('fas_logout_intent')).toBe('manual')
    })
})
