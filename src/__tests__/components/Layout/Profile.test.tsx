import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Profile from '@/app/(Uygulama)/components/Layout/Vertical/Header/Profile/Profile'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(() => '/dashboard'),
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    })),
}))

// Mock ProfileItems because it uses usePathname internally which is giving issues
vi.mock('../../../app/(Uygulama)/components/Layout/Vertical/Header/Profile/ProfileItems', () => ({
    default: () => <div data-testid="mock-profile-items">Mock Profile Items</div>
}))


// Mock the resetToNull action
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

        const avatar = screen.getByAltText('ProfileImg')
        expect(avatar).toBeInTheDocument()
    })

    it('should open popover when profile button is clicked', async () => {
        render(
            <Provider store={store}>
                <Profile />
            </Provider>
        )

        // IconButton has aria-label="show 11 new notifications" in the source (likely copy-paste error in source)
        const profileButton = screen.getByLabelText('show 11 new notifications')
        fireEvent.click(profileButton)

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

        const profileButton = screen.getByLabelText('show 11 new notifications')
        fireEvent.click(profileButton)

        await waitFor(() => {
            expect(screen.getByText('Çıkış')).toBeInTheDocument()
        })
    })

    it('should close popover when clicking outside', async () => {
        render(
            <Provider store={store}>
                <Profile />
            </Provider>
        )

        const profileButton = screen.getByLabelText('show 11 new notifications')
        fireEvent.click(profileButton)

        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument()
        })

        // Simulate clicking outside by clicking the backdrop
        const backdrop = document.querySelector('.MuiBackdrop-root')
        if (backdrop) {
            fireEvent.click(backdrop)
        } else {
            // Fallback to escape if backdrop not found
            fireEvent.keyDown(document, { key: 'Escape' })
        }

        await waitFor(() => {
            // In MUI, the element might still be in the DOM but not visible
            const userInfo = screen.queryByText('Test User')
            expect(userInfo).not.toBeVisible()
        }, { timeout: 2000 })

    })

    it('should format yetki correctly when camelCase', async () => {
        store = configureStore({
            reducer: {
                userReducer: () => ({
                    kullaniciAdi: 'Test User',
                    yetki: 'BaşDenetçi',
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

        const profileButton = screen.getByLabelText('show 11 new notifications')
        fireEvent.click(profileButton)

        await waitFor(() => {
            // The component should format "BaşDenetçi" to "Baş Denetçi"
            const yetkiElement = screen.getByText(/Baş Denetçi/i)
            expect(yetkiElement).toBeInTheDocument()
        })
    })
})
