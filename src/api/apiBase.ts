import Logger from "@/utils/Logger";
import {
  LOGOUT_INTENT_KEY,
  clearClientAuthStorage,
  buildRefreshRequestBody,
  persistSessionTokens,
  readStoredAuthTokens,
} from "@/utils/authSession";
import { LOGOUT_REASON_KEY, LogoutReason } from "@/utils/sessionConfig";
import { url } from "./apiConfig";

const LOCAL_API_URL = "http://localhost:5000/api";
const BETA_API_URL = "https://betaapi.fasmart.app/api";
const ENV_API_URL = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL?.trim() : undefined;
const ENABLE_LOCAL_BETA_FALLBACK =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_ENABLE_LOCAL_BETA_FALLBACK === "1";

const normalizeApiBaseUrl = (baseUrl: string) =>
  (baseUrl || "").trim().replace(/\/+$/, "");

export { url };

const LOGIN_ROUTE_PATH = "/";
const MAINTENANCE_ROUTE_PATH = "/maintenance";

const isAuthEndpoint = (path: string) => {
  const lowerPath = path.toLowerCase();
  // Sadece login ve refresh'te token GÖNDERME
  // Logout ve Session auth header (Bearer token) gerektirdiği için 
  // onları bu istisnanın dışında tutuyoruz.
  return (
    lowerPath === "/auth/login" ||
    lowerPath === "/auth/refresh"
  );
};

const getApiBaseUrlCandidates = () => {
  const candidates: string[] = [];

  const addCandidate = (candidate?: string | null) => {
    if (!candidate) return;
    const normalized = normalizeApiBaseUrl(candidate);
    if (!normalized) return;
    if (!candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  };

  if (ENV_API_URL) {
    addCandidate(ENV_API_URL);
    return candidates;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
    const isHttps = window.location.protocol === "https:";

    if (isLocalHost) {
      addCandidate(LOCAL_API_URL);
      if (ENABLE_LOCAL_BETA_FALLBACK) {
        addCandidate(BETA_API_URL);
      }
      return candidates;
    }

    // HTTPS sayfada HTTP local backend mixed-content olarak bloklanabilir.
    if (isHttps) {
      addCandidate(BETA_API_URL);
      return candidates;
    }

    addCandidate(LOCAL_API_URL);
    addCandidate(BETA_API_URL);
    return candidates;
  }

  addCandidate(url);
  addCandidate(BETA_API_URL);

  return candidates;
};

const isConnectionLikeError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return (
    message.includes("Failed to fetch") ||
    message.includes("NetworkError") ||
    message.includes("fetch failed")
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

const clearSessionTokens = () => {
  clearClientAuthStorage();
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
  clearClientAuthStorage();
  redirectTo(LOGIN_ROUTE_PATH);
};

const redirectToMaintenance = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === LOGIN_ROUTE_PATH) return;
  if (window.location.pathname === MAINTENANCE_ROUTE_PATH) return;
  redirectTo(MAINTENANCE_ROUTE_PATH);
};

const tryRedirectToLoginOnSessionExpired = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === LOGIN_ROUTE_PATH) return;
  if (shouldSkipLoginRedirect()) {
    console.warn("🧪 Debug modu aktif: session-expired login redirect atlandı.");
    return;
  }
  window.sessionStorage.setItem(LOGOUT_REASON_KEY, LogoutReason.SERVER_EXPIRED);
  redirectTo(LOGIN_ROUTE_PATH);
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
  const apiBaseCandidates = getApiBaseUrlCandidates();
  let activeApiBaseUrl = apiBaseCandidates[0] || url;
  let fullUrl = `${activeApiBaseUrl}${normalizedPath}`;

  let denetlenenIdFromStorage: string | null = null;
  let yilFromStorage: string | null = null;
  let sessionAccessToken: string | null = null;

  if (typeof window !== "undefined") {
    if (!ignoreCustomHeaders) {
      denetlenenIdFromStorage = window.localStorage.getItem("fas_denetlenenId");
      yilFromStorage = window.localStorage.getItem("fas_yil");
    }
    const rawAccessToken = readStoredAuthTokens().accessToken;
    if (rawAccessToken && rawAccessToken !== "undefined" && rawAccessToken !== "null") {
      sessionAccessToken = rawAccessToken;
    }
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
    const buildUnauthorizedError = async (response: Response, reason: string) => {
      let unauthorizedMessage = "Oturum suresi dolmus. Lutfen tekrar giris yapin.";

      try {
        const unauthorizedText = await response.clone().text();
        if (unauthorizedText) {
          try {
            const unauthorizedParsed = JSON.parse(unauthorizedText);
            const parsedMessage =
              unauthorizedParsed?.message ||
              unauthorizedParsed?.Message ||
              unauthorizedParsed?.title;
            if (parsedMessage) {
              unauthorizedMessage = String(parsedMessage);
            }
          } catch {
            unauthorizedMessage = unauthorizedText.trim().replace(/^"+|"+$/g, "") || unauthorizedMessage;
          }
        }
      } catch {
        // no-op
      }

      Logger.warn(`API 401 - yetkisiz erisim (${normalizedPath})`, {
        reason,
        message: unauthorizedMessage,
      }, {
        source: "api",
        requestPath: normalizedPath,
        statusCode: 401,
      });

      clearSessionTokens();
      tryRedirectToLoginOnSessionExpired();
      return new Error(unauthorizedMessage);
    };

    let response: Response | undefined;
    let lastConnectionError: unknown;

    for (let i = 0; i < apiBaseCandidates.length; i++) {
      const candidateBaseUrl = apiBaseCandidates[i];
      activeApiBaseUrl = candidateBaseUrl;
      fullUrl = `${candidateBaseUrl}${normalizedPath}`;

      try {
        response = await fetch(fullUrl, {
          ...rest,
          headers: mergedHeaders,
          signal: controller.signal,
          credentials: includeCredentials ? "include" : "omit",
        });
        break;
      } catch (fetchError) {
        const canTryNextBase = i < apiBaseCandidates.length - 1;
        const isAbortError = (fetchError as any)?.name === "AbortError";

        if (!canTryNextBase || isAbortError || !isConnectionLikeError(fetchError)) {
          throw fetchError;
        }

        lastConnectionError = fetchError;
        const nextBaseUrl = apiBaseCandidates[i + 1];

        Logger.warn(
          "API base erisim hatasi, alternatif base deneniyor",
          {
            failedBaseUrl: candidateBaseUrl,
            nextBaseUrl,
            path: normalizedPath,
            error:
              fetchError instanceof Error
                ? fetchError.message
                : String(fetchError),
          },
          { source: "network", requestPath: normalizedPath }
        );
      }
    }

    if (!response) {
      throw lastConnectionError ?? new Error("Failed to fetch");
    }

    // 🔐 GÜVENLIK: Token expiry (401)
    // Not: 403 yetki problemidir, refresh ile düzelmeyebilir; loop'a girmemesi için refresh denemiyoruz.
    if (response.status === 401) {
      // Login or Refresh endpoints themselves shouldn't trigger another refresh
      // Aynı zamanda /auth/session da token check endpoint'i olduğu için fail olması refresh'i loop'a sokmamalıdır.
      if (isAuthEndpoint(normalizedPath) || normalizedPath.toLowerCase() === "/auth/session" || normalizedPath.toLowerCase() === "/auth/logout") {
        return response;
      }

      // En fazla 1 kez retry: sonsuz refresh döngüsünü engelle
      if (__retryCount >= 1) {
        console.error(`❌ API 401 devam ediyor, retry sınırına ulaşıldı (${path}).`);
        throw await buildUnauthorizedError(response, "retry-limit-reached");
      }

      console.warn(`⚠️ API ${response.status} hatası alındı (${path}), session yenilenmesi deneniyor...`);

      if (typeof window !== "undefined") {
        try {
          type RefreshAttemptResult = {
            ok: boolean;
            status: number;
            payload: any;
          };

          // Tek bir refresh isteği paylaşımı (concurrent 401 storm için)
          const activeRefreshPromise = (window as any)
            ._activeRefreshPromise as Promise<RefreshAttemptResult> | undefined;
          const refreshTokenCandidate = readStoredAuthTokens().refreshToken;
          const refreshPromise =
            activeRefreshPromise ||
            (async () => {
              const refreshResponse = await fetch(`${activeApiBaseUrl}/Auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: buildRefreshRequestBody(refreshTokenCandidate),
                credentials: "include",
              });
              const refreshPayload = await refreshResponse.json().catch(() => null);

              return {
                ok: refreshResponse.ok,
                status: refreshResponse.status,
                payload: refreshPayload,
              };
            })();

          if (!activeRefreshPromise) {
            (window as any)._activeRefreshPromise = refreshPromise;
          }

          const refreshResponse = await refreshPromise;
          (window as any)._activeRefreshPromise = undefined;

          if (refreshResponse.ok) {
            const refreshData = refreshResponse.payload;
            if (refreshData) {
              const nextToken = refreshData.token || refreshData.Token;
              const nextRefreshToken = refreshData.refreshToken || refreshData.RefreshToken;
              if (nextToken || nextRefreshToken) {
                persistSessionTokens(nextToken, nextRefreshToken || refreshTokenCandidate);
              }
            }
            console.log("✅ Session başarıyla yenilendi, istek tekrar deneniyor.");

            return await apiFetch(path, {
              ...options,
              __retryCount: __retryCount + 1,
            });
          } else {
            console.error("❌ Session yenileme başarısız. İstek login redirect olmadan sonlandırıldı.");
            Logger.warn("API 401 - session refresh başarısız", {
              path: normalizedPath,
              refreshStatus: refreshResponse.status,
            }, {
              source: "api",
              requestPath: normalizedPath,
              statusCode: 401,
            });
          }
        } catch (refreshError) {
          (window as any)._activeRefreshPromise = undefined;
          console.error("❌ Session yenileme sırasında kritik hata:", refreshError);
          Logger.error("API 401 - session refresh sırasında kritik hata", refreshError, {
            source: "api",
            requestPath: normalizedPath,
            statusCode: 401,
          });
        }
      }
      throw await buildUnauthorizedError(response, "refresh-failed");
    }

    if (response.status >= 500) {
      console.error(`❌ [API] Sunucu hatası: ${response.status} (${normalizedPath})`);
      Logger.error(`API sunucu hatası: ${response.status} (${normalizedPath})`, undefined, {
        source: "api",
        requestPath: normalizedPath,
        statusCode: response.status,
      });
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

      // Beklenen iş kuralı: paylaşım bağlantısı henüz oluşturulmamış olabilir.
      // Bu durum log üretmemeli ve akışı bozmamalıdır.
      if (isBaglantiByTipNoConnection) {
        return undefined as any;
      }

      if (response.status < 500) {
        Logger.warn(`API yanıt hatası: ${response.status} (${normalizedPath})`, {
          message: normalizedMessage || undefined,
          body: parsed ?? text,
        }, {
          source: "api",
          requestPath: normalizedPath,
          statusCode: response.status,
        });
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
      Logger.error(`API Timeout: ${path} (${timeout}ms)`, error, {
        source: "network",
        requestPath: normalizedPath,
      });
      redirectToMaintenance();
      const timeoutError = new Error(`İstek zaman aşımına uğradı (${timeout}ms). İsteği yeniden deneyin.`);
      throw timeoutError;
    }

    const errorMessage = error?.message || String(error);
    const isConnectionError = isConnectionLikeError(error);
    const isUnauthorizedError = errorMessage === "Unauthorized - aborting request";

    if (isConnectionError) {
      redirectToMaintenance();
      Logger.error(`API bağlantı hatası: ${path}`, { errorMessage, fullUrl }, {
        source: "network",
        requestPath: normalizedPath,
      });
      const detailedError = `
❌ [API Connection Error]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Path: ${path}
URL: ${fullUrl}
Error: Backend sunucuya bağlanılamıyor

✅ Çözüm:
1. Backend server'ının çalıştığını kontrol edin: ${activeApiBaseUrl}
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
      Logger.warn(`API Unauthorized: ${path}`, undefined, {
        source: "api",
        requestPath: normalizedPath,
      });
      throw error;
    } else {
      console.error(`❌ [API Error] ${path}:`, errorMessage);
      Logger.error(`API Error: ${path}`, { errorMessage }, {
        source: "api",
        requestPath: normalizedPath,
      });
      throw error;
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
