export const url = "https://betaapi.fasmart.app/api";
//export const url = "http://localhost:5000/api";

import Logger from "@/utils/Logger";

const LOGIN_ROUTE_PATH = "/";
const MAINTENANCE_ROUTE_PATH = "/maintenance";
const SESSION_ACCESS_TOKEN_KEY = "fas_session_token";
const SESSION_REFRESH_TOKEN_KEY = "fas_session_refreshToken";
const LOGOUT_INTENT_KEY = "fas_logout_intent";

const isAuthEndpoint = (path: string) => {
  const lowerPath = path.toLowerCase();
  return (
    lowerPath === "/auth/login" ||
    lowerPath === "/auth/refresh" ||
    lowerPath === "/auth/logout"
  );
};

const redirectTo = (targetPath: string) => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === targetPath) return;
  window.location.href = targetPath;
};

const shouldSkipLoginRedirect = () => {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem("fas_debug_no_login_redirect") === "1";
};

const hasLogoutIntent = () => {
  if (typeof window === "undefined") return false;
  return !!window.sessionStorage.getItem(LOGOUT_INTENT_KEY);
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  if (!hasLogoutIntent()) {
    console.warn("⚠️ Otomatik login redirect engellendi: logout intent yok.");
    return;
  }
  if (shouldSkipLoginRedirect()) {
    console.warn("🧪 Debug modu aktif: login redirect atlandı (fas_debug_no_login_redirect=1).");
    return;
  }
  window.sessionStorage.removeItem(LOGOUT_INTENT_KEY);
  window.localStorage.removeItem("persist:root");
  window.sessionStorage.removeItem("reduxState");
  window.sessionStorage.removeItem(SESSION_ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(SESSION_REFRESH_TOKEN_KEY);
  redirectTo(LOGIN_ROUTE_PATH);
};

const redirectToMaintenance = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === LOGIN_ROUTE_PATH) return;
  redirectTo(MAINTENANCE_ROUTE_PATH);
};

/**
 * ✅ İYİLEŞTİRİLMİŞ API Fetch fonksiyonu (Güvenlik Kontrolleri)
 */
export async function apiFetch(
  path: string,
  options: RequestInit & {
    timeout?: number;
    ignoreCustomHeaders?: boolean;
    includeCredentials?: boolean;
    suppressErrorLog?: boolean;
    __retryCount?: number;
  } = {}
) {
  const {
    headers,
    timeout = 120000,
    ignoreCustomHeaders = false,
    includeCredentials = true,
    suppressErrorLog = false,
    __retryCount = 0,
    ...rest
  } = options;

  const clientUrl =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "";

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${url.endsWith('/') ? url.slice(0, -1) : url}${normalizedPath}`;

  let denetlenenIdFromStorage: string | null = null;
  let yilFromStorage: string | null = null;
  let sessionAccessToken: string | null = null;

  if (typeof window !== "undefined" && !ignoreCustomHeaders) {
    denetlenenIdFromStorage = window.localStorage.getItem("fas_denetlenenId");
    yilFromStorage = window.localStorage.getItem("fas_yil");
    sessionAccessToken = window.sessionStorage.getItem(SESSION_ACCESS_TOKEN_KEY);
  }

  const mergedHeaders: HeadersInit = {
    ...(headers || {}),
    "X-Client-Url": clientUrl,
    ...(!ignoreCustomHeaders && denetlenenIdFromStorage
      ? { "X-Denetlenen-Id": denetlenenIdFromStorage }
      : {}),
    ...(!ignoreCustomHeaders && yilFromStorage ? { "X-Yil": yilFromStorage } : {}),
    ...(!isAuthEndpoint(normalizedPath) && sessionAccessToken
      ? { Authorization: `Bearer ${sessionAccessToken}` }
      : {}),
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

    // 🔐 GÜVENLIK: Token expiry (401)
    // Not: 403 yetki problemidir, refresh ile düzelmeyebilir; loop'a girmemesi için refresh denemiyoruz.
    if (response.status === 401) {
      // Login or Refresh endpoints themselves shouldn't trigger another refresh
      if (isAuthEndpoint(normalizedPath)) {
        return response;
      }

      // En fazla 1 kez retry: sonsuz refresh döngüsünü engelle
      if (__retryCount >= 1) {
        console.error(`❌ API 401 devam ediyor, retry sınırına ulaşıldı (${path}).`);
        return response;
      }

      console.warn(`⚠️ API ${response.status} hatası alındı (${path}), session yenilenmesi deneniyor...`);

      if (typeof window !== "undefined") {
        try {
          // Tek bir refresh isteği paylaşımı (concurrent 401 storm için)
          const activeRefreshPromise = (window as any)._activeRefreshPromise as Promise<Response> | undefined;
          const refreshTokenCandidate =
            window.sessionStorage.getItem(SESSION_REFRESH_TOKEN_KEY) ||
            window.localStorage.getItem("fas_refreshToken");
          if (!refreshTokenCandidate) {
            console.warn("⚠️ Session refresh atlandı: refresh token bulunamadı.");
            return response;
          }
          const refreshPromise =
            activeRefreshPromise ||
            fetch(`${url.endsWith('/') ? url.slice(0, -1) : url}/Auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                refreshToken: refreshTokenCandidate,
                RefreshToken: refreshTokenCandidate,
              }),
              credentials: "include", // HttpOnly cookie'leri gönder
            });

          if (!activeRefreshPromise) {
            (window as any)._activeRefreshPromise = refreshPromise;
          }

          const refreshResponse = await refreshPromise;
          (window as any)._activeRefreshPromise = undefined;

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json().catch(() => null);
            if (refreshData) {
              const nextToken = refreshData.token || refreshData.Token;
              const nextRefreshToken = refreshData.refreshToken || refreshData.RefreshToken;
              if (nextToken) {
                window.sessionStorage.setItem(SESSION_ACCESS_TOKEN_KEY, nextToken);
              }
              if (nextRefreshToken) {
                window.sessionStorage.setItem(SESSION_REFRESH_TOKEN_KEY, nextRefreshToken);
              }
            }
            console.log("✅ Session başarıyla yenilendi, istek tekrar deneniyor.");

            return await apiFetch(path, {
              ...options,
              __retryCount: __retryCount + 1,
            });
          } else {
            console.error("❌ Session yenileme başarısız. İstek login redirect olmadan sonlandırıldı.");
          }
        } catch (refreshError) {
          (window as any)._activeRefreshPromise = undefined;
          console.error("❌ Session yenileme sırasında kritik hata:", refreshError);
        }
      }
      return response;
    }

    if (response.status >= 500) {
      console.error(`❌ [API] Sunucu hatası: ${response.status} (${normalizedPath})`);
      if (!isAuthEndpoint(normalizedPath)) {
        redirectToMaintenance();
      }
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

      const parsedMessage =
        typeof parsed === "string"
          ? parsed
          : parsed?.message;
      const rawMessage =
        typeof text === "string" ? text.trim().replace(/^"+|"+$/g, "") : "";
      const normalizedMessage = (parsedMessage || rawMessage || "")
        .toString()
        .trim()
        .replace(/^"+|"+$/g, "");

      const isBaglantiByTipNoConnection =
        response.status === 400 &&
        normalizedPath.startsWith("/BaglantiBilgileri/BaglantiBilgileriByTip") &&
        normalizedMessage === "Bağlantı oluşturulmamış.";

      // Sadece bu özel durumda akışı bozma ve error seviyesinde loglama yapma
      if (isBaglantiByTipNoConnection) {
        console.info(
          `[API INFO] ${response.status} ${normalizedPath}: ${normalizedMessage}`
        );
        return undefined as any;
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
      redirectToMaintenance();
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
      redirectToMaintenance();
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
