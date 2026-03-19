import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createMenuItems } from './MenuItems'

const applyDynamicIconsToMenuItemsMock = vi.fn((items) => items)

vi.mock('@/utils/menuIconResolver', () => ({
    applyDynamicIconsToMenuItems: (items: any) => applyDynamicIconsToMenuItemsMock(items),
}))

const flattenMenu = (items: any[]): any[] =>
    items.flatMap((item) => [item, ...(item.children ? flattenMenu(item.children) : [])])

describe('createMenuItems', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns simplified menu for undefined roles', () => {
        const menu = createMenuItems()
        const flatMenu = flattenMenu(menu)

        expect(applyDynamicIconsToMenuItemsMock).toHaveBeenCalled()
        expect(flatMenu.some((item) => item.href === '/Anasayfa')).toBe(true)
        expect(flatMenu.some((item) => item.href === '/Musteri/MusteriIslemleri')).toBe(true)
        expect(flatMenu.some((item) => item.href === '/DigerIslemler/TestSonuclari')).toBe(true)
        expect(flatMenu.some((item) => item.href === '/DigerIslemler/SistemLoglari')).toBe(false)
    })

    it('adds admin-only links for restricted finance control role', () => {
        const menu = createMenuItems(['FinansalTabloKontrol'], 'Tfrs', false, false, false, 2025, 'FasAdmin')
        const flatMenu = flattenMenu(menu)

        expect(flatMenu.some((item) => item.href === '/DigerIslemler/SistemLoglari')).toBe(true)
        expect(flatMenu.some((item) => item.href === '/DigerIslemler/AuditLoglari')).toBe(true)
        expect(flatMenu.some((item) => item.href === '/KullanimKilavuzu')).toBe(true)
    })

    it('returns extended audit menu for full-access users and feature flags', () => {
        const menu = createMenuItems(['Denetci'], 'Bobi', true, true, true, 2025, 'FasAdmin')
        const flatMenu = flattenMenu(menu)

        expect(flatMenu.some((item) => item.href === '/Veri/Mizanlar/EDefterMizan')).toBe(true)
        expect(flatMenu.some((item) => item.href === '/PlanVeProgram/DenetimProgrami')).toBe(true)
        expect(flatMenu.some((item) => item.href === '/PlanVeProgram/DenetimPlanindaOnemlilik/OnemlilikVeOrneklem')).toBe(true)
        expect(flatMenu.some((item) => item.href === '/Konsolidasyon/BirlestirilmisMizan')).toBe(true)
        expect(flatMenu.some((item) => item.href === '/Bddk')).toBe(true)
        expect(flatMenu.some((item) => item.href === '/DenetimDosya/DenetimDosyaYazdir')).toBe(true)
        expect(flatMenu.some((item) => item.href === '/DigerIslemler/EnflasyonLoglari')).toBe(true)
    })
})
