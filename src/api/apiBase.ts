export const url = "https://betaapi.fasmart.app/api";
//export const url = "http://localhost:5000/api";

// 🔐 Güvenlik: Token manager import
import SecureTokenManager from "@/utils/SecureTokenManager";
import Logger from "@/utils/Logger";

/**
 * ✅ İYİLEŞTİRİLMİŞ API Fetch fonksiyonu (Güvenlik Kontrolleri)
 */
export async function apiFetch(
  path: string,
  options: RequestInit & { timeout?: number; ignoreCustomHeaders?: boolean; includeCredentials?: boolean; suppressErrorLog?: boolean } = {}
) {
  const { headers, timeout = 120000, ignoreCustomHeaders = false, includeCredentials = true, suppressErrorLog = false, ...rest } = options;

  const clientUrl =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "";

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${url.endsWith('/') ? url.slice(0, -1) : url}${normalizedPath}`;

  let denetlenenIdFromStorage: string | null = null;
  let yilFromStorage: string | null = null;

  if (typeof window !== "undefined" && !ignoreCustomHeaders) {
    denetlenenIdFromStorage = window.localStorage.getItem("fas_denetlenenId");
    yilFromStorage = window.localStorage.getItem("fas_yil");

    // HttpOnly cookie kullanımı nedeniyle token'ı localStorage'dan okumuyoruz.
    // fetch(..., { credentials: 'include' }) ile otomatik gönderiliyor (includeCredentials: true ise).
  }

  const mergedHeaders: HeadersInit = {
    ...(headers || {}),
    "X-Client-Url": clientUrl,
    ...(!ignoreCustomHeaders && denetlenenIdFromStorage
      ? { "X-Denetlenen-Id": denetlenenIdFromStorage }
      : {}),
    ...(!ignoreCustomHeaders && yilFromStorage ? { "X-Yil": yilFromStorage } : {}),
    // Authorization header manuel eklenmiyor, cookie tabanlı auth kullanılıyor.
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(fullUrl, {
      ...rest,
      headers: mergedHeaders,
      signal: controller.signal,
      credentials: includeCredentials ? 'include' : 'omit',
    });

    // 🔐 GÜVENLIK: Token expiry (401) or Permission Mismatch (403)
    if (response.status === 401 || response.status === 403) {
      const lowerPath = path.toLowerCase();
      // Login or Refresh endpoints themselves shouldn't trigger another refresh
      if (lowerPath === '/auth/login' || lowerPath === '/auth/refresh') {
        return response;
      }

      console.warn(`⚠️ API ${response.status} hatası alındı (${path}), session yenilenmesi deneniyor...`);

      if (typeof window !== "undefined") {
        try {
          // Check if we are already refreshing to avoid infinite loops
          const isRefreshing = (window as any)._isRefreshing;
          if (isRefreshing) {
            console.warn("⏳ Zaten bir yenileme işlemi devam ediyor, bekleniyor...");
            // Optionally wait or just fail to avoid loops
            return response;
          }
          (window as any)._isRefreshing = true;

          const refreshResponse = await fetch(`${url.endsWith('/') ? url.slice(0, -1) : url}/Auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: window.localStorage.getItem("fas_refreshToken") }),
            credentials: 'include', // HttpOnly cookie'leri gönder
          });

          (window as any)._isRefreshing = false;

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            console.log("✅ Session başarıyla yenilendi, istek tekrar deneniyor.");

            // Eğer token döndüyse (opsiyonel, genelde cookie yeter ama state için gerekebilir)
            if (refreshData) {
              if (refreshData.token) localStorage.setItem("fas_token", refreshData.token);
              if (refreshData.refreshToken) localStorage.setItem("fas_refreshToken", refreshData.refreshToken);
              // Redux state update is handled by the caller or triggers on next rehydration
            }

            return await apiFetch(path, options);
          } else {
            console.error("❌ Session yenileme başarısız. Oturum kapatılıyor.");

            // Sadece gerçekten başarısızsa logout yap
            window.localStorage.removeItem("persist:root");
            window.sessionStorage.removeItem("reduxState");
            if (window.location && window.location.pathname !== "/") {
              window.location.href = "/";
            }
          }
        } catch (refreshError) {
          (window as any)._isRefreshing = false;
          console.error("❌ Session yenileme sırasında kritik hata:", refreshError);
        }
      }
      return response;
    }

    // 400+ response: log and parse body
    if (!response.ok) {
      const text = await response.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = undefined;
      }
      if (!suppressErrorLog) {
        console.error("API ERROR", response.status, parsed ?? text);
      }

      if (suppressErrorLog) {
        return response;
      }

      if (parsed && parsed.errors) {
        throw new Error(JSON.stringify(parsed.errors));
      } else {
        throw new Error(parsed?.message || text || `HTTP ${response.status}`);
      }
    }

    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      console.warn(`⏱️ [API] Timeout: ${path} (${timeout}ms)`);
      const timeoutError = new Error(`İstek zaman aşımına uğradı (${timeout}ms). İsteği yeniden deneyin.`);
      Logger.error(`API Timeout: ${path}`, error);
      throw timeoutError;
    }

    // 📝 Log error to file
    Logger.error(`API Fetch Error: ${path}`, error);

    const errorMessage = error?.message || String(error);
    const isConnectionError = errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError") || errorMessage.includes("fetch failed");
    const isUnauthorizedError = errorMessage === "Unauthorized - aborting request";

    if (isConnectionError) {
      const detailedError = `
❌ [API Connection Error]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Path: ${path}
URL: ${url}
Error: Backend sunucuya bağlanılamıyor

✅ Çözüm:
1. Backend server'ının çalıştığını kontrol edin: http://localhost:5000
2. Firewall/VPN ayarlarını kontrol edin
3. Sayfayı yenileyin (F5)
4. Tarayıcı konsolundaki tüm hataları kontrol edin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      console.error(detailedError);

      // 📝 Development mode'de daha detaylı hata göster
      if (typeof window !== "undefined") {
        console.group("🔧 [API Debug Info]");
        console.log("Full URL:", fullUrl);
        console.log("Method:", rest.method || "GET");
        console.log("Headers:", mergedHeaders);
        console.log("Credentials:", includeCredentials ? "include" : "omit");
        console.groupEnd();
      }

      throw new Error(
        path.includes("/MaddiDogrulama")
          ? "Muhasebe verileri yüklenemedi. Lütfen sayfayı yenileyin."
          : "Sisteme şu an ulaşılamıyor. Lütfen daha sonra tekrar deneyin."
      );
    } else if (isUnauthorizedError) {
      // ⚠️ Token validasyonu başarısız oldu
      console.warn(`⚠️ [API] Unauthorized: ${path} - Token kontrolü başarısız`);
      throw error;
    } else {
      console.error(`❌ [API Error] ${path}:`, errorMessage);
      throw error;
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
