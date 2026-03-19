import { configureStore } from '@reduxjs/toolkit'
import UserReducer, {
    resetToNull,
    setDenetlenen,
    setRefreshToken,
    setSonSecilenBddkmi,
    setTurTamamlandi,
    setUserData,
} from '@/store/user/UserSlice'

describe('UserSlice', () => {
    let store: any

    beforeEach(() => {
        store = configureStore({
            reducer: {
                user: UserReducer,
            },
        })
    })

    it('should have correct initial state', () => {
        const state = store.getState().user

        expect(state).toHaveProperty('kullaniciAdi')
        expect(state).toHaveProperty('token')
        expect(state).toHaveProperty('denetlenenId')
        expect(state.kullaniciAdi).toBe('')
        expect(state.token).toBe('')
        expect(state.denetlenenId).toBe(0)
    })

    it('should set user data with setUserData action', () => {
        store.dispatch(
            setUserData({
                kullaniciAdi: 'Test User',
                yetki: 'Admin',
                mail: 'test@example.com',
                token: 'mock-jwt-token',
            })
        )

        const state = store.getState().user
        expect(state.kullaniciAdi).toBe('Test User')
        expect(state.yetki).toBe('Admin')
        expect(state.mail).toBe('test@example.com')
        expect(state.token).toBe('mock-jwt-token')
    })

    it('should reset user to undefined with resetToNull action', () => {
        store.dispatch(
            setUserData({
                kullaniciAdi: 'Test User',
                yetki: 'Admin',
                mail: 'test@example.com',
                token: 'mock-jwt-token',
            })
        )

        store.dispatch(resetToNull(''))
        const state = store.getState().user
        expect(state.kullaniciAdi).toBeUndefined()
        expect(state.token).toBeUndefined()
        expect(state.yetki).toBeUndefined()
        expect(state.refreshToken).toBeUndefined()
    })

    it('should handle multiple user updates', () => {
        store.dispatch(setUserData({ kullaniciAdi: 'User 1' }))
        expect(store.getState().user.kullaniciAdi).toBe('User 1')

        store.dispatch(
            setUserData({
                kullaniciAdi: 'User 2',
                yetki: 'Denetci',
            })
        )

        expect(store.getState().user.kullaniciAdi).toBe('User 2')
        expect(store.getState().user.yetki).toBe('Denetci')
    })

    it('should map denetlenen payload fields into current selection state', () => {
        store.dispatch(
            setDenetlenen({
                id: 55,
                adi: 'ABC A.S.',
                year: 2025,
                denetimTuru: 'TFRS',
                bobimi: true,
                tfrsmi: true,
                enflasyonmu: false,
                konsolidemi: true,
            })
        )

        const state = store.getState().user
        expect(state.denetlenenId).toBe(55)
        expect(state.denetlenenFirmaAdi).toBe('ABC A.S.')
        expect(state.yil).toBe(2025)
        expect(state.denetimTuru).toBe('TFRS')
        expect(state.bobimi).toBe(true)
        expect(state.tfrsmi).toBe(true)
        expect(state.konsolidemi).toBe(true)
    })

    it('should update individual session and selection flags', () => {
        store.dispatch(setRefreshToken('refresh-123'))
        store.dispatch(setTurTamamlandi(true))
        store.dispatch(setSonSecilenBddkmi(true))

        const state = store.getState().user
        expect(state.refreshToken).toBe('refresh-123')
        expect(state.turTamamlandi).toBe(true)
        expect(state.sonSecilenBddkmi).toBe(true)
    })

    it('should not reset state when resetToNull is called with a non-empty payload', () => {
        store.dispatch(
            setUserData({
                kullaniciAdi: 'Persisted User',
                token: 'token-123',
            })
        )

        store.dispatch(resetToNull('keep-state'))

        const state = store.getState().user
        expect(state.kullaniciAdi).toBe('Persisted User')
        expect(state.token).toBe('token-123')
    })
})
