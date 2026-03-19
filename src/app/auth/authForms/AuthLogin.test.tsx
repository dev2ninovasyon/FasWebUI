import { screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AuthLogin from './AuthLogin'
import { renderWithProviders } from '@/test/test-utils'
import * as apiBase from '@/api/apiBase'
import * as notistack from 'notistack'

const { pushMock, replaceMock, executeRecaptchaMock } = vi.hoisted(() => {
    return {
        pushMock: vi.fn(),
        replaceMock: vi.fn(),
        executeRecaptchaMock: vi.fn(),
    }
})

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
        replace: replaceMock,
    }),
    usePathname: () => '/auth/login',
}))

vi.mock('react-google-recaptcha-v3', () => ({
    useGoogleReCaptcha: () => ({
        executeRecaptcha: executeRecaptchaMock,
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
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    beforeEach(() => {
        vi.clearAllMocks()
        executeRecaptchaMock.mockResolvedValue('mock-captcha-token')
        consoleLogSpy.mockClear()
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
        const mockApiResponse = {
            ok: true,
            json: async () => ({
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
            }),
        }

        vi.mocked(apiBase.apiFetch).mockResolvedValue(mockApiResponse as any)

        renderWithProviders(<AuthLogin />)

        fireEvent.change(screen.getByPlaceholderText(/Email adresiniz/i), {
            target: { value: 'test@example.com' },
        })
        fireEvent.change(screen.getByLabelText(/Şifre/i), {
            target: { value: 'password123' },
        })
        fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }))

        await waitFor(() => {
            expect(apiBase.apiFetch).toHaveBeenCalled()
            expect(replaceMock).toHaveBeenCalledWith('/Anasayfa')
        })
    })

    it('shows error on login failure', async () => {
        vi.mocked(apiBase.apiFetch).mockResolvedValue({
            ok: false,
            text: async () => JSON.stringify({ Message: 'Invalid credentials' }),
        } as any)

        renderWithProviders(<AuthLogin />)

        fireEvent.change(screen.getByPlaceholderText(/Email adresiniz/i), {
            target: { value: 'wrong@example.com' },
        })
        fireEvent.change(screen.getByLabelText(/Şifre/i), {
            target: { value: 'wrongpass' },
        })
        fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }))

        await waitFor(() => {
            expect(notistack.enqueueSnackbar).toHaveBeenCalledWith('Invalid credentials', expect.anything())
            expect(pushMock).not.toHaveBeenCalled()
        })
    })

    it('shows error when recaptcha verification fails', async () => {
        executeRecaptchaMock.mockRejectedValue(new Error('captcha failed'))

        renderWithProviders(<AuthLogin />)

        fireEvent.change(screen.getByPlaceholderText(/Email adresiniz/i), {
            target: { value: 'test@example.com' },
        })
        fireEvent.change(screen.getByLabelText(/Şifre/i), {
            target: { value: 'password123' },
        })
        fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }))

        await waitFor(() => {
            expect(notistack.enqueueSnackbar).toHaveBeenCalledWith(
                'Güvenlik doğrulaması sırasında bir hata oluştu.',
                expect.anything()
            )
            expect(apiBase.apiFetch).not.toHaveBeenCalled()
        })
    })

    it('shows extension-specific guidance when recaptcha channel closes', async () => {
        executeRecaptchaMock.mockRejectedValue(new Error('message channel closed'))

        renderWithProviders(<AuthLogin />)

        fireEvent.change(screen.getByPlaceholderText(/Email adresiniz/i), {
            target: { value: 'test@example.com' },
        })
        fireEvent.change(screen.getByLabelText(/Şifre/i), {
            target: { value: 'password123' },
        })
        fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }))

        await waitFor(() => {
            expect(notistack.enqueueSnackbar).toHaveBeenCalledWith(
                'Tarayıcı eklentileriniz güvenlik doğrulamasını engelliyor olabilir. Lütfen reklam engelleyici veya benzeri eklentileri kapatıp tekrar deneyin.',
                expect.anything()
            )
            expect(apiBase.apiFetch).not.toHaveBeenCalled()
        })
    })

    it('shows warning when recaptcha returns an empty token', async () => {
        executeRecaptchaMock.mockResolvedValue('')

        renderWithProviders(<AuthLogin />)

        fireEvent.change(screen.getByPlaceholderText(/Email adresiniz/i), {
            target: { value: 'test@example.com' },
        })
        fireEvent.change(screen.getByLabelText(/Şifre/i), {
            target: { value: 'password123' },
        })
        fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }))

        await waitFor(() => {
            expect(notistack.enqueueSnackbar).toHaveBeenCalledWith(
                'Recaptcha doğrulaması başarısız.',
                expect.anything()
            )
            expect(apiBase.apiFetch).not.toHaveBeenCalled()
        })
    })

    it('shows connection error when login request fails with network issue', async () => {
        vi.mocked(apiBase.apiFetch).mockRejectedValue(new Error('Failed to fetch'))

        renderWithProviders(<AuthLogin />)

        fireEvent.change(screen.getByPlaceholderText(/Email adresiniz/i), {
            target: { value: 'test@example.com' },
        })
        fireEvent.change(screen.getByLabelText(/Şifre/i), {
            target: { value: 'password123' },
        })
        fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }))

        await waitFor(() => {
            expect(notistack.enqueueSnackbar).toHaveBeenCalledWith(
                'Bağlantı hatası: Sisteme şu an ulaşılamıyor. Lütfen daha sonra tekrar deneyiniz.',
                expect.anything()
            )
        })
    })
})
