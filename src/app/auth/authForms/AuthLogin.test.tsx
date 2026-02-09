import { screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import AuthLogin from './AuthLogin'
import { renderWithProviders } from '@/test/test-utils'
import * as navigation from 'next/navigation'
import * as apiBase from '@/api/apiBase'
import * as notistack from 'notistack'

// Hoist the mock function so it's available before vi.mock
const { pushMock } = vi.hoisted(() => {
    return { pushMock: vi.fn() }
})

// Mocks
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
    }),
    usePathname: () => '/auth/login',
}))

vi.mock('react-google-recaptcha-v3', () => ({
    useGoogleReCaptcha: () => ({
        executeRecaptcha: vi.fn().mockResolvedValue('mock-captcha-token'),
    }),
}))

vi.mock('notistack', async () => {
    const actual = await vi.importActual('notistack')
    return {
        ...actual,
        enqueueSnackbar: vi.fn(),
    }
})

vi.mock('@/api/apiBase', () => ({
    apiFetch: vi.fn(),
}))

const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

describe('AuthLogin Component', () => {
    // Mock console methods to prevent output noise and potential jsdom issues
    const consoleTimeSpy = vi.spyOn(console, 'time').mockImplementation(() => { })
    const consoleTimeEndSpy = vi.spyOn(console, 'timeEnd').mockImplementation(() => { })

    beforeEach(() => {
        vi.clearAllMocks()
        consoleTimeSpy.mockClear()
        consoleTimeEndSpy.mockClear()
        localStorageMock.getItem.mockClear()
        localStorageMock.setItem.mockClear()
        localStorageMock.removeItem.mockClear()
    })

    it('renders login form correctly', () => {
        renderWithProviders(<AuthLogin title="Giriş Yap" />)

        expect(screen.getByRole('heading', { name: /Giriş Yap/i })).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Email adresiniz/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Şifreniz/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument()
    })

    it('handles input changes', () => {
        renderWithProviders(<AuthLogin />)

        const emailInput = screen.getByPlaceholderText(/Email adresiniz/i)
        const passwordInput = screen.getByPlaceholderText(/Şifreniz/i)

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        expect(emailInput).toHaveValue('test@example.com')
        expect(passwordInput).toHaveValue('password123')
    })

    it('submits form and navigates on success', async () => {
        const mockData = {
            token: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token',
            userId: 1,
            kullaniciAdi: 'TestUser',
            yetki: 'Admin',
            rol: ['Manager'],
            bddkmi: false,
            kurulumTamamlandi: true,
            denetciId: 123,
            denetciFirmaAdi: 'Test Corp',
            unvan: 'Tester',
            kurulumAdimi: 1,
            setupWizardProgress: '10%',
            sonSecilenDenetlenenId: 0,
            sonSecilenYil: 0,
            sonSecilenDenetlenenFirmaAdi: null,
            sonSecilenDenetimTuru: null,
            sonSecilenBobimi: false,
            sonSecilenTfrsmi: false,
            sonSecilenEnflasyonmu: false,
            sonSecilenKonsolidemi: false,
            sonSecilenBddkmi: false,
            turTamamlandi: false,
        }

        const mockApiResponse = {
            ok: true,
            json: async () => mockData,
        }

        vi.mocked(apiBase.apiFetch).mockResolvedValue(mockApiResponse as any)

        renderWithProviders(<AuthLogin />)

        const emailInput = screen.getByPlaceholderText(/Email adresiniz/i)
        const passwordInput = screen.getByPlaceholderText(/Şifreniz/i)
        const submitButton = screen.getByRole('button', { name: /Giriş Yap/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(apiBase.apiFetch).toHaveBeenCalled()
            expect(pushMock).toHaveBeenCalledWith('/Anasayfa')
        })
    })

    it('shows error on login failure', async () => {
        const mockApiResponse = {
            ok: false,
            text: async () => JSON.stringify({ Message: 'Invalid credentials' }),
        }

        vi.mocked(apiBase.apiFetch).mockResolvedValue(mockApiResponse as any)

        renderWithProviders(<AuthLogin />)

        const emailInput = screen.getByPlaceholderText(/Email adresiniz/i)
        const passwordInput = screen.getByPlaceholderText(/Şifreniz/i)
        const submitButton = screen.getByRole('button', { name: /Giriş Yap/i })

        fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(notistack.enqueueSnackbar).toHaveBeenCalledWith('Invalid credentials', expect.anything())
            expect(pushMock).not.toHaveBeenCalled()
        })
    })
})
