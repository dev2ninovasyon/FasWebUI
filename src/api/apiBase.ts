//export const url = "https://betaapi.fasmart.app/api";
export const url = "http://localhost:5000/api"; // ✅ HTTP for localhost development (backend HTTP port)

// 🔐 Güvenlik: Token manager import
import SecureTokenManager from "@/utils/SecureTokenManager";
import Logger from "@/utils/Logger";

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
        // 🔄 PROAKTİF YENİLEME: Token süresi dolmak üzereyse (son 5 dk) sessizce yenile
        if (path !== '/Auth/login' && path !== '/Auth/refresh' && SecureTokenManager.shouldRefreshToken()) {
          const refreshToken = window.localStorage.getItem("fas_refreshToken");
          if (refreshToken) {
            console.log("🔄 Token süresi dolmak üzere, proaktif yenileme yapılıyor...");
            try {
              const refreshResponse = await fetch(`${url.endsWith('/') ? url.slice(0, -1) : url}/Auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
              });

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData?.token) {
                  SecureTokenManager.saveTokens(refreshData.token, refreshData.refreshToken);
                  console.log("✅ Proaktif yenileme başarılı.");
                }
              }
            } catch (e) {
              console.warn("⚠️ Proaktif yenileme başarısız, yine de devam ediliyor:", e);
            }
          }
        }

        // ✅ İYİLEŞTİRME: SecureTokenManager öncelikle kullan
        tokenFromStorage = SecureTokenManager.getAccessToken();

        // ⚠️ FALLBACK: SecureTokenManager null döndürürse (validation fail),
        // raw localStorage token'ını kullan. Backend 401/403 ile gerçek validasyonu yapar.
        if (!tokenFromStorage) {
          const rawToken = window.localStorage.getItem("fas_token");
          if (rawToken) {
            console.log("ℹ️ SecureTokenManager null döndü, raw localStorage token kullanılıyor");
            tokenFromStorage = rawToken;
          }
        }

        // Login/Refresh path'leri hariç, token yoksa request gönderme
        if (!tokenFromStorage && path !== '/Auth/login' && path !== '/Auth/refresh') {
          console.warn('⚠️ Token bulunamadı. Request iptal ediliyor:', path);
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

      // Login ve refresh path'leri için 401 kontrolünü pas geç, çağıran yer yönetsin
      if (path === '/Auth/login' || path === '/Auth/refresh') {
        return response;
      }

      if (typeof window !== "undefined") {
        // Sadece gerçekten oturum kapalıysa ve token geçersizse temizle
        const currentToken = typeof SecureTokenManager !== 'undefined' ? SecureTokenManager.getAccessToken() : window.localStorage.getItem("fas_token");

        if (!currentToken) {
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
        } else {
          console.log("ℹ️ 401 alındı ancak token hala mevcut. Refresh denenmesi gerekebilir veya yetki hatası.");
        }
      }
      // 🔐 GÜVENLIK: Yetki hatası (403 Forbidden) - Şirket mismatch durumunda refresh deniyoruz
    } else if (response.status === 403) {
      console.warn(`⚠️ Bu işlem için yetkiniz bulunmamaktadır (403 Forbidden). Path: ${path}`);

      // Şirket değişimi sonrası token'daki eski claim'ler (denetlenenId mismatch) nedeniyle 403 alınabilir.
      // Bu durumda sessizce token yenilemeyi deneyip isteği tekrar gönderiyoruz.
      if (typeof window !== "undefined" && path !== '/Auth/refresh' && path !== '/Auth/login') {
        const refreshToken = window.localStorage.getItem("fas_refreshToken");

        if (refreshToken) {
          console.log("ℹ️ 403 alındı, token yenilenerek tekrar deniniyor...");

          try {
            // Token yenileme isteği
            const refreshResponse = await fetch(`${url.endsWith('/') ? url.slice(0, -1) : url}/Auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              if (refreshData && refreshData.token) {
                // Yeni tokenları kaydet
                if (typeof SecureTokenManager !== 'undefined') {
                  SecureTokenManager.saveTokens(refreshData.token, refreshData.refreshToken);
                } else {
                  window.localStorage.setItem("fas_token", refreshData.token);
                  window.localStorage.setItem("fas_refreshToken", refreshData.refreshToken);
                }

                // Orijinal isteği yeni token ile tekrar dene
                return await apiFetch(path, options);
              }
            } else {
              console.warn("⚠️ Refresh token başarısız oldu ama oturum geçerli olabilir. Devam ediliyor...");
            }
          } catch (refreshError) {
            console.error("❌ Token yenileme sırasında hata:", refreshError);
          }
        }

        // ⚠️ CRITICAL FIX: Şirket değiştirme sırasında 403 alınabilir.
        // Eğer şirket değiştirme flow'undaysak (localStorage'da yeni değerler var),
        // kullanıcıyı logout etmeden sadece 403 response'u dönelim.
        // Page reload sonrası yeni token ile düzelecek.
        const currentDenetlenenId = window.localStorage.getItem("fas_denetlenenId");
        const hasValidSession = window.localStorage.getItem("fas_token") || window.localStorage.getItem("fas_refreshToken");

        if (currentDenetlenenId && hasValidSession) {
          console.warn("⚠️ 403 hatası alındı ancak şirket değiştirme flow'u tespit edildi. Logout yapılmadan devam ediliyor.");
          // Response'u olduğu gibi dönelim, çağıran fonksiyon kendi error handling'ini yapsın
          return response;
        }

        // Eğer kesinlikle yetki yoksa ve refresh de başarısız olduysa, o zaman logout yap
        console.error("❌ Yetki hatası ve refresh başarısız. Oturum kapatılıyor.");
        if (window.location.pathname !== "/") {
          if (typeof SecureTokenManager !== 'undefined') {
            SecureTokenManager.clearAllTokens();
          } else {
            window.localStorage.removeItem("fas_token");
            window.localStorage.removeItem("fas_refreshToken");
          }
          window.localStorage.removeItem("persist:root");
          window.location.href = "/";
        }
      }
    }


    return response;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Fetch aborted for:", path);
      return { success: false, message: "İstek zaman aşımına uğradı veya iptal edildi." };
    }

    // 📝 Log error to file
    Logger.error(`API Fetch Error: ${path}`, error);

    const isConnectionError = error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError");
    const isUnauthorizedError = error.message === "Unauthorized - aborting request";

    if (isConnectionError) {
      console.error(`❌ API Bağlantı Hatası (${path}): Sisteme ulaşılamıyor. API servisinin çalıştığından emin olun.`);

      // Sadece bağlantı hatası VE token gerçekten yoksa login'e yönlendir
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        const hasToken = window.localStorage.getItem("fas_token");
        if (!hasToken) {
          window.localStorage.removeItem("persist:root");
          window.sessionStorage.removeItem("reduxState");
          window.location.href = "/";
        }
      }
    } else if (isUnauthorizedError) {
      // ⚠️ Token validasyonu başarısız oldu ama login'e yönlendirme YAPMA
      console.warn(`⚠️ API Yetkisiz Erişim (${path}): Token kontrolü başarısız. Sayfa reload sonrası normal düzelebilir.`);
    } else {
      console.error(`❌ API Hata (${path}):`, error.message);
    }

    throw error;
  } finally {
    // If a timeout mechanism was active, clear it here if necessary
  }
}
