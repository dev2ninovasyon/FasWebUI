import { configureStore } from '@reduxjs/toolkit'
import customizerReducer, {
    hoverSidebar,
    setAvatar,
    setBorderRadius,
    setCardShadow,
    setCollapse,
    setDarkMode,
    setDir,
    setLanguage,
    setNotificationSound,
    setTheme,
    toggleHorizontal,
    toggleLayout,
    toggleMobileSidebar,
    toggleSidebar,
} from '@/store/customizer/CustomizerSlice'

describe('CustomizerSlice', () => {
    const createStore = () =>
        configureStore({
            reducer: {
                customizer: customizerReducer,
            },
        })

    it('should expose expected defaults', () => {
        const store = createStore()
        expect(store.getState().customizer).toMatchObject({
            activeTheme: 'BLUE_THEME',
            activeMode: 'light',
            activeDir: 'ltr',
            avatarSrc: '/images/profile/user-1.jpg',
            isLayout: 'full',
            isCollapse: false,
            isNotificationSound: true,
        })
    })

    it('should update direct settable fields', () => {
        const store = createStore()

        store.dispatch(setTheme('GREEN_THEME'))
        store.dispatch(setDarkMode('dark'))
        store.dispatch(setDir('rtl'))
        store.dispatch(setAvatar('/avatar.png'))
        store.dispatch(setLanguage('en'))
        store.dispatch(setCardShadow(false))
        store.dispatch(setCollapse(true))
        store.dispatch(hoverSidebar(true))
        store.dispatch(toggleLayout('boxed'))
        store.dispatch(toggleHorizontal(true))
        store.dispatch(setBorderRadius(12))
        store.dispatch(setNotificationSound(false))

        expect(store.getState().customizer).toMatchObject({
            activeTheme: 'GREEN_THEME',
            activeMode: 'dark',
            activeDir: 'rtl',
            avatarSrc: '/avatar.png',
            isLanguage: 'en',
            isCardShadow: false,
            isCollapse: true,
            isSidebarHover: true,
            isLayout: 'boxed',
            isHorizontal: true,
            borderRadius: 12,
            isNotificationSound: false,
        })
    })

    it('should toggle sidebar and mobile sidebar flags', () => {
        const store = createStore()

        store.dispatch(toggleSidebar())
        expect(store.getState().customizer.isCollapse).toBe(true)

        store.dispatch(toggleSidebar())
        expect(store.getState().customizer.isCollapse).toBe(false)

        store.dispatch(toggleMobileSidebar())
        expect(store.getState().customizer.isMobileSidebar).toBe(true)

        store.dispatch(toggleMobileSidebar())
        expect(store.getState().customizer.isMobileSidebar).toBe(false)
    })
})
