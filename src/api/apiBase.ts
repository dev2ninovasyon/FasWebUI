//export const url = "https://betaapi.fasmart.app/api";
export const url = "http://localhost:5000/api"; // ✅ HTTP for localhost development (backend HTTP port)

// 🔐 Güvenlik: Token manager import
import SecureTokenManager from "@/utils/SecureTokenManager";

/**
 * ✅ İYİLEŞTİRİLMİŞ API Fetch fonksiyonu (Güvenlik Kontrolleri)
 */
export async function apiFetch(
  path: string,
  options: RequestInit & { timeout?: number; ignoreCustomHeaders?: boolean } = {}
) {
  const { headers, timeout = 120000, ignoreCustomHeaders = false, ...rest } = options;

  const clientUrl =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    let denetlenenIdFromStorage: string | null = null;
    let yilFromStorage: string | null = null;
    let tokenFromStorage: string | null = null;

    if (typeof window !== "undefined" && !ignoreCustomHeaders) {
      denetlenenIdFromStorage = window.localStorage.getItem("fas_denetlenenId");
      yilFromStorage = window.localStorage.getItem("fas_yil");

      if (typeof SecureTokenManager !== 'undefined') {
        tokenFromStorage = SecureTokenManager.getAccessToken();

        // Login/Refresh path'leri hariç, token yoksa request gönderme
        if (!tokenFromStorage && path !== '/Auth/login' && path !== '/Auth/refresh') {
          console.warn('⚠️ Token bulunamadı veya geçersiz. Request iptal ediliyor:', path);
          throw new Error('Unauthorized - aborting request');
        }
      } else {
        tokenFromStorage = window.localStorage.getItem("fas_token");
      }
    }

    const mergedHeaders: HeadersInit = {
      ...(headers || {}),
      "X-Client-Url": clientUrl,
      ...(!ignoreCustomHeaders && denetlenenIdFromStorage
        ? { "X-Denetlenen-Id": denetlenenIdFromStorage }
        : {}),
      ...(!ignoreCustomHeaders && yilFromStorage ? { "X-Yil": yilFromStorage } : {}),
      ...(tokenFromStorage && !ignoreCustomHeaders
        ? { "Authorization": `Bearer ${tokenFromStorage}` }
        : {}),
    };

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const fullUrl = `${url.endsWith('/') ? url.slice(0, -1) : url}${normalizedPath}`;

    const response = await fetch(fullUrl, {
      ...rest,
      headers: mergedHeaders,
      signal: controller.signal,
      credentials: 'include',
    });

    // 🔐 GÜVENLIK: Token expiry handle etme (401 Unauthorized)
    if (response.status === 401) {
      console.warn(`⚠️ Token süresi dolmuş ya da yetkisiz erişim (401 Unauthorized)`);

      if (typeof window !== "undefined") {
        if (typeof SecureTokenManager !== 'undefined') {
          SecureTokenManager.clearAllTokens();
        } else {
          window.localStorage.removeItem("fas_token");
          window.localStorage.removeItem("fas_refreshToken");
        }
        window.localStorage.removeItem("persist:root");
        window.sessionStorage.removeItem("reduxState");

        if (window.location && window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
    } else if (response.status === 403) {
      console.warn(`⚠️ Bu işlem için yetkiniz bulunmamaktadır (403 Forbidden). Path: ${path}`);
    }

    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`❌ API İstek Timeout (${path}):`, timeout + "ms");
    } else {
      const isConnectionError = error.message === "Failed to fetch";
      const isUnauthorizedError = error.message === "Unauthorized - aborting request";

      if (isConnectionError || isUnauthorizedError) {
        if (isConnectionError) {
          console.error(`❌ API Bağlantı Hatası (${path}): Sisteme ulaşılamıyor. API servisinin çalıştığından emin olun.`);
        } else {
          console.error(`❌ API Yetkisiz Erişim (${path}): Oturum bulunamadı veya süresi dolmuş.`);
        }

        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          if (typeof SecureTokenManager !== 'undefined') {
            SecureTokenManager.clearAllTokens();
          } else {
            window.localStorage.removeItem("fas_token");
            window.localStorage.removeItem("fas_refreshToken");
          }
          window.localStorage.removeItem("persist:root");
          window.location.href = "/";
        }
      } else {
        console.error(`❌ API Hata (${path}):`, error.message);
      }
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
