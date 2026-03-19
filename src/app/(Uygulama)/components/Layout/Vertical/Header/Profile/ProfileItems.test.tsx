import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileItems from './ProfileItems'
import { renderWithProviders } from '@/test/test-utils'
import * as customizerActions from '@/store/customizer/CustomizerSlice'

vi.mock('next/navigation', () => ({
    usePathname: () => '/Kullanici/KullaniciIslemleri',
}))

vi.mock('./ProfileItem', () => ({
    default: ({ item, onClick }: any) => (
        <button type="button" onClick={onClick}>
            {item.title}
        </button>
    ),
}))

vi.mock('./ProfileCollapse', () => ({
    default: ({ menu, onClick }: any) => (
        <button type="button" onClick={onClick}>
            {menu.title}
        </button>
    ),
}))

describe('ProfileItems', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders profile shortcuts and toggles mobile sidebar on click', () => {
        const toggleMobileSidebarSpy = vi.spyOn(customizerActions, 'toggleMobileSidebar')

        renderWithProviders(<ProfileItems />)

        fireEvent.click(screen.getByRole('button', { name: 'Hesap Ayarları' }))
        fireEvent.click(screen.getByRole('button', { name: 'Tema Ayarları' }))
        fireEvent.click(screen.getByRole('button', { name: 'Kullanıcı' }))

        expect(toggleMobileSidebarSpy).toHaveBeenCalledTimes(3)
    })
})
