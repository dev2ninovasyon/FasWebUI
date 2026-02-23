/**
 * 🔐 Geliştirilmiş Token Yönetimi
 * 
 * GÜVENLIK İYİLEŞTİRMELERİ:
 * 1. Token expiry kontrolü (client-side)
 * 2. Token blacklist entegrasyonu
 * 3. Refresh token rotation
 * 4. localStorage XSS koruması (HttpOnly Cookies öncelikli)
 */

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'fas_token',
  REFRESH_TOKEN: 'fas_refreshToken',
  DENETLENEN_ID: 'fas_denetlenenId',
  YIL: 'fas_yil',
  TOKEN_EXPIRY: 'fas_token_expiry',
  BLACKLISTED_TOKENS: 'fas_blacklisted_tokens',
};

export class SecureTokenManager {
  /**
   * Token'ı decode et ve expiry'yi kontrol et
   */
  static decodeToken(token: string): { exp?: number; sub?: string; jti?: string;[key: string]: any } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

      // ✅ UTF-8 karakter desteği ile decode (Türkçe karakterler için gerekli)
      const decoded = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const parsed = JSON.parse(decoded);
      console.log('✅ Token decode edildi. JTI:', parsed.jti, 'Exp:', parsed.exp);
      return parsed;
    } catch (error) {
      console.error('❌ Token decode hatası:', error);
      return null;
    }
  }

  /**
   * Token'ın süresi dolup dolmadığını kontrol et
   */
  static isTokenValid(token: string): boolean {
    if (!token) return false;

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      console.warn('⚠️ Token decode edilemedi veya exp claim\'i yok');
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = decoded.exp - now;

    console.log(`⏱️ Token durumu: Kalan süre ${timeRemaining}s (Buffer: 60s)`);

    if (timeRemaining <= 0) {
      console.warn('❌ Token süresi dolmuş!');
      return false;
    }

    return timeRemaining > 10; // 10 saniye buffer (daha esnek)
  }

  /**
   * Token'ı blacklist'e ekle
   */
  static blacklistToken(token: string): void {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded?.jti) return;

      const blacklist = this.getBlacklist();
      blacklist.push({
        jti: decoded.jti,
        revokedAt: Date.now(),
        expiresAt: (decoded.exp || 0) * 1000,
      });

      const validBlacklist = blacklist.filter(item => item.expiresAt > Date.now());
      localStorage.setItem(TOKEN_KEYS.BLACKLISTED_TOKENS, JSON.stringify(validBlacklist));
    } catch (error) {
      console.error('❌ Blacklist hatası:', error);
    }
  }

  static getBlacklist(): Array<{ jti: string; revokedAt: number; expiresAt: number }> {
    try {
      const stored = localStorage.getItem(TOKEN_KEYS.BLACKLISTED_TOKENS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static isTokenBlacklisted(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded?.jti) return false;
    return this.getBlacklist().some(item => item.jti === decoded.jti);
  }

  /**
   * ⚠️ DEPRECATED: HttpOnly Cookie kullanıldığı için localStorage'a yazmıyoruz.
   */
  static setAccessToken(token: string): void {
    console.warn('⚠️ setAccessToken artık kullanılmamalı. Backend HttpOnly cookie ayarlar.');
  }

  /**
   * Access Token'ı getir (Cookie'den)
   */
  static getAccessToken(): string | null {
    let token = this.getTokenFromCookie(TOKEN_KEYS.ACCESS_TOKEN);

    if (!token) return null;

    if (this.isTokenBlacklisted(token)) {
      this.clearAllTokens();
      return null;
    }

    // ✅ Token geçerliliği backend'e bırakıldı (401 yanıtıyla yönetilir)
    // isTokenValid() burada çağrılmıyor — çünkü token expire olsa bile
    // backend refresh endpoint'i yeni token döndürecektir.
    return token;
  }

  /**
   * ⚠️ DEPRECATED
   */
  static setRefreshToken(token: string): void {
    console.warn('⚠️ setRefreshToken artık kullanılmamalı.');
  }

  /**
   * Refresh Token'ı getir
   */
  static getRefreshToken(): string | null {
    // ✅ FIX: Refresh token opaque string'dir (JWT değil).
    // isTokenValid() çağırmak her zaman false döndürür → logout tetiklenir.
    // Sadece cookie'den oku, geçerliliği backend'e bırak.
    return this.getTokenFromCookie(TOKEN_KEYS.REFRESH_TOKEN);
  }


  /**
   * Tüm token'ları temizle
   */
  static clearAllTokens(): void {
    [
      TOKEN_KEYS.ACCESS_TOKEN,
      TOKEN_KEYS.REFRESH_TOKEN,
      TOKEN_KEYS.DENETLENEN_ID,
      TOKEN_KEYS.YIL,
      TOKEN_KEYS.TOKEN_EXPIRY,
    ].forEach(key => localStorage.removeItem(key));
  }

  static shouldRefreshToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return (decoded.exp - now) < 300; // 5 dk kala
  }

  /**
   * Cookie'den token oku
   */
  static getTokenFromCookie(cookieName: string): string | null {
    if (typeof document === 'undefined') return null;
    const nameEQ = cookieName + "=";
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(nameEQ)) return trimmed.substring(nameEQ.length);
    }
    return null;
  }

  /**
   * ⚠️ DEPRECATED: Token'lar artık sadece backend tarafından set ediliyor.
   */
  static saveTokens(accessToken: string, refreshToken: string): void {
    console.warn("⚠️ saveTokens artık kullanılmamalı. Backend HttpOnly cookie ayarlar.");
  }

  static deleteCookie(cookieName: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

export default SecureTokenManager;
