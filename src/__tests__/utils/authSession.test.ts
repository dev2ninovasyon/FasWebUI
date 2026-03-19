import {
    SESSION_ACCESS_TOKEN_KEY,
    SESSION_REFRESH_TOKEN_KEY,
    LEGACY_SESSION_ACCESS_TOKEN_KEY,
    LEGACY_SESSION_REFRESH_TOKEN_KEY,
    buildRefreshRequestBody,
    clearClientAuthStorage,
    createAuthorizedAxiosConfig,
    createAuthorizedHeaders,
    getRequestAccessToken,
    mapAuthPayloadToUserData,
    persistSessionTokens,
    readStoredAuthTokens,
    syncSelectionStorageFromUserData,
} from '@/utils/authSession'

describe('authSession utilities', () => {
    beforeEach(() => {
        window.localStorage.clear()
        window.sessionStorage.clear()
    })

    it('should read tokens with local-storage priority and legacy fallback', () => {
        window.sessionStorage.setItem(LEGACY_SESSION_ACCESS_TOKEN_KEY, 'legacy-access')
        window.sessionStorage.setItem(LEGACY_SESSION_REFRESH_TOKEN_KEY, 'legacy-refresh')

        expect(readStoredAuthTokens()).toEqual({
            accessToken: 'legacy-access',
            refreshToken: 'legacy-refresh',
        })

        window.sessionStorage.setItem(SESSION_ACCESS_TOKEN_KEY, 'session-access')
        window.sessionStorage.setItem(SESSION_REFRESH_TOKEN_KEY, 'session-refresh')

        expect(readStoredAuthTokens()).toEqual({
            accessToken: 'session-access',
            refreshToken: 'session-refresh',
        })

        window.localStorage.setItem(SESSION_ACCESS_TOKEN_KEY, 'local-access')
        window.localStorage.setItem(SESSION_REFRESH_TOKEN_KEY, 'local-refresh')

        expect(readStoredAuthTokens()).toEqual({
            accessToken: 'local-access',
            refreshToken: 'local-refresh',
        })
    })

    it('should persist and clear session tokens in both storages', () => {
        persistSessionTokens('access-token', 'refresh-token')

        expect(window.sessionStorage.getItem(SESSION_ACCESS_TOKEN_KEY)).toBe('access-token')
        expect(window.localStorage.getItem(SESSION_ACCESS_TOKEN_KEY)).toBe('access-token')
        expect(window.sessionStorage.getItem(SESSION_REFRESH_TOKEN_KEY)).toBe('refresh-token')
        expect(window.localStorage.getItem(SESSION_REFRESH_TOKEN_KEY)).toBe('refresh-token')

        persistSessionTokens('', '')

        expect(window.sessionStorage.getItem(SESSION_ACCESS_TOKEN_KEY)).toBeNull()
        expect(window.localStorage.getItem(SESSION_ACCESS_TOKEN_KEY)).toBeNull()
        expect(window.sessionStorage.getItem(SESSION_REFRESH_TOKEN_KEY)).toBeNull()
        expect(window.localStorage.getItem(SESSION_REFRESH_TOKEN_KEY)).toBeNull()
    })

    it('should create authorized headers and axios config from preferred or stored token', () => {
        window.sessionStorage.setItem(SESSION_ACCESS_TOKEN_KEY, 'stored-token')

        expect(getRequestAccessToken()).toBe('stored-token')
        expect(getRequestAccessToken('preferred-token')).toBe('preferred-token')

        expect(createAuthorizedHeaders({ Accept: 'application/json' })).toEqual({
            Accept: 'application/json',
            Authorization: 'Bearer stored-token',
        })

        expect(
            createAuthorizedAxiosConfig(
                { headers: { Accept: 'application/json' } },
                'preferred-token'
            )
        ).toEqual({
            withCredentials: true,
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer preferred-token',
            },
        })
    })

    it('should map auth payload and selection fallback from storage', () => {
        window.localStorage.setItem('fas_denetlenenId', '44')
        window.localStorage.setItem('fas_yil', '2026')

        const userData = mapAuthPayloadToUserData(
            {
                Token: 'payload-token',
                RefreshToken: 'payload-refresh',
                UserId: 5,
                DenetciId: 8,
                KullaniciAdi: 'Demo User',
                Yetki: 'Admin',
                SonSecilenDenetlenenFirmaAdi: 'Fallback Company',
                SonSecilenDenetimTuru: 'Bagimsiz',
                SonSecilenBobimi: true,
                SonSecilenTfrsmi: false,
                SonSecilenEnflasyonmu: true,
                SonSecilenKonsolidemi: false,
            },
            { mail: 'demo@example.com' }
        )

        expect(userData).toMatchObject({
            token: 'payload-token',
            refreshToken: 'payload-refresh',
            id: 5,
            denetciId: 8,
            kullaniciAdi: 'Demo User',
            yetki: 'Admin',
            mail: 'demo@example.com',
            denetlenenId: 44,
            yil: 2026,
            denetlenenFirmaAdi: 'Fallback Company',
            denetimTuru: 'Bagimsiz',
            bobimi: true,
            tfrsmi: false,
            enflasyonmu: true,
            konsolidemi: false,
        })
    })

    it('should build refresh payload and sync selection storage', () => {
        expect(buildRefreshRequestBody('refresh-token')).toBe(
            JSON.stringify({
                refreshToken: 'refresh-token',
                RefreshToken: 'refresh-token',
            })
        )
        expect(buildRefreshRequestBody('')).toBeUndefined()

        syncSelectionStorageFromUserData({ denetlenenId: 91, yil: 2025 })
        expect(window.localStorage.getItem('fas_denetlenenId')).toBe('91')
        expect(window.localStorage.getItem('fas_yil')).toBe('2025')

        syncSelectionStorageFromUserData({})
        expect(window.localStorage.getItem('fas_denetlenenId')).toBeNull()
        expect(window.localStorage.getItem('fas_yil')).toBeNull()
    })

    it('should clear client auth storage including legacy keys', () => {
        window.localStorage.setItem(SESSION_ACCESS_TOKEN_KEY, 'local-access')
        window.localStorage.setItem(SESSION_REFRESH_TOKEN_KEY, 'local-refresh')
        window.sessionStorage.setItem(LEGACY_SESSION_ACCESS_TOKEN_KEY, 'legacy-access')
        window.sessionStorage.setItem(LEGACY_SESSION_REFRESH_TOKEN_KEY, 'legacy-refresh')

        clearClientAuthStorage()

        expect(window.localStorage.getItem(SESSION_ACCESS_TOKEN_KEY)).toBeNull()
        expect(window.localStorage.getItem(SESSION_REFRESH_TOKEN_KEY)).toBeNull()
        expect(window.sessionStorage.getItem(LEGACY_SESSION_ACCESS_TOKEN_KEY)).toBeNull()
        expect(window.sessionStorage.getItem(LEGACY_SESSION_REFRESH_TOKEN_KEY)).toBeNull()
    })
})
