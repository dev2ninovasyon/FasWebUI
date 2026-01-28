import { configureStore } from '@reduxjs/toolkit'
import UserReducer, { setUserData, resetToNull } from '@/store/user/UserSlice'

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

        // UserSlice has a full initial state, not an empty object
        expect(state).toHaveProperty('kullaniciAdi')
        expect(state).toHaveProperty('token')
        expect(state).toHaveProperty('denetlenenId')
        expect(state.kullaniciAdi).toBe('')
        expect(state.token).toBe('')
        expect(state.denetlenenId).toBe(0)
    })

    it('should set user data with setUserData action', () => {
        const userData = {
            kullaniciAdi: 'Test User',
            yetki: 'Admin',
            mail: 'test@example.com',
            token: 'mock-jwt-token',
        }

        store.dispatch(setUserData(userData))

        const state = store.getState().user
        expect(state.kullaniciAdi).toBe('Test User')
        expect(state.yetki).toBe('Admin')
        expect(state.mail).toBe('test@example.com')
        expect(state.token).toBe('mock-jwt-token')
    })

    it('should reset user to undefined with resetToNull action', () => {
        const userData = {
            kullaniciAdi: 'Test User',
            yetki: 'Admin',
            mail: 'test@example.com',
            token: 'mock-jwt-token',
        }

        // Set user first
        store.dispatch(setUserData(userData))
        expect(store.getState().user.kullaniciAdi).toBe('Test User')

        // Then reset
        store.dispatch(resetToNull(''))
        const state = store.getState().user
        expect(state.kullaniciAdi).toBeUndefined()
        expect(state.token).toBeUndefined()
        expect(state.yetki).toBeUndefined()
    })

    it('should handle multiple user updates', () => {
        const user1 = {
            kullaniciAdi: 'User 1',
        }

        const user2 = {
            kullaniciAdi: 'User 2',
            yetki: 'Denetçi',
        }

        store.dispatch(setUserData(user1))
        expect(store.getState().user.kullaniciAdi).toBe('User 1')

        store.dispatch(setUserData(user2))
        expect(store.getState().user.kullaniciAdi).toBe('User 2')
        expect(store.getState().user.yetki).toBe('Denetçi')
    })
})
