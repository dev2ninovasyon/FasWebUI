import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Page from './page'

const { selectorMock, dispatchMock, updateTurTamamlandiMock, driverTourPropsMock } = vi.hoisted(() => ({
    selectorMock: vi.fn(),
    dispatchMock: vi.fn(),
    updateTurTamamlandiMock: vi.fn(),
    driverTourPropsMock: vi.fn(),
}))

vi.mock('next/dynamic', () => ({
    default: () => () => <div data-testid="dynamic-dashboard-card" />,
}))

vi.mock('@/app/(Uygulama)/components/Container/PageContainer', () => ({
    default: ({ children, title }: any) => (
        <div data-testid="page-container">
            <h1>{title}</h1>
            {children}
        </div>
    ),
}))

vi.mock('@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb', () => ({
    default: ({ title }: any) => <div>{title}</div>,
}))

vi.mock('@/app/(Uygulama)/components/Dashboards/DriverTour', () => ({
    default: ({ run, onClose }: any) => {
        driverTourPropsMock({ run, onClose })
        return (
            <button onClick={onClose} type="button">
                DriverTour {run ? 'active' : 'inactive'}
            </button>
        )
    },
}))

vi.mock('@/store/hooks', () => ({
    useSelector: selectorMock,
    useDispatch: () => dispatchMock,
}))

vi.mock('@/api/Kullanici/KullaniciAyarlar', () => ({
    updateTurTamamlandi: updateTurTamamlandiMock,
}))

vi.mock('@/store/user/UserSlice', () => ({
    setTurTamamlandi: (value: boolean) => ({
        type: 'user/setTurTamamlandi',
        payload: value,
    }),
}))

describe('Anasayfa Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        selectorMock.mockReturnValue({ id: 7, turTamamlandi: false })
        updateTurTamamlandiMock.mockResolvedValue(undefined)
    })

    it('renders dashboard shell and dynamic cards', async () => {
        render(<Page />)

        expect(screen.getAllByTestId('dynamic-dashboard-card')).toHaveLength(2)
        expect(screen.getByText('Ana Sayfa')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'DriverTour active' })).toBeInTheDocument()
    })

    it('updates user tour state when the onboarding tour is closed', async () => {
        render(<Page />)
        fireEvent.click(screen.getAllByRole('button', { name: 'DriverTour active' })[0])

        await waitFor(() => {
            expect(updateTurTamamlandiMock).toHaveBeenCalledWith(7, true)
            expect(dispatchMock).toHaveBeenCalledWith({
                type: 'user/setTurTamamlandi',
                payload: true,
            })
        })
    })
})
