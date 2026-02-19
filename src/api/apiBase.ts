//export const url = "https://betaapi.fasmart.app/api";
export const url = "http://localhost:5000/api";

// 🔐 Güvenlik: Token manager import
import SecureTokenManager from "@/utils/SecureTokenManager";
import Logger from "@/utils/Logger";

/**
 * ✅ İYİLEŞTİRİLMİŞ API Fetch fonksiyonu (Güvenlik Kontrolleri)
 */
export async function apiFetch(
  path: string,
  options: RequestInit & { timeout?: number; ignoreCustomHeaders?: boolean; includeCredentials?: boolean } = {}
) {
  const { headers, timeout = 120000, ignoreCustomHeaders = false, includeCredentials = true, ...rest } = options;

  const clientUrl =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
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

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const fullUrl = `${url.endsWith('/') ? url.slice(0, -1) : url}${normalizedPath}`;

    const response = await fetch(fullUrl, {
      ...rest,
      headers: mergedHeaders,
      signal: controller.signal,
      credentials: includeCredentials ? 'include' : 'omit',
    });

    // 🔐 GÜVENLIK: Token expiry handle etme (401 Unauthorized)
    if (response.status === 401) {
      console.warn(`⚠️ Token süresi dolmuş ya da yetkisiz erişim (401 Unauthorized)`);

      // Login ve refresh path'leri için 401 kontrolünü pas geç, çağıran yer yönetsin
      const lowerPath = path.toLowerCase();
      if (lowerPath === '/auth/login' || lowerPath === '/auth/refresh') {
        return response;
      }

      if (typeof window !== "undefined") {
        // 401 durumunda oturumun kapandığı varsayılır. 
        // Cookie'ler zaten sunucu tarafından HttpOnly olarak yönetiliyor.
        window.localStorage.removeItem("persist:root");
        window.sessionStorage.removeItem("reduxState");

        if (window.location && window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
      // 🔐 GÜVENLIK: Yetki hatası (403 Forbidden) - Şirket mismatch durumunda refresh deniyoruz
    } else if (response.status === 403) {
      console.warn(`⚠️ Bu işlem için yetkiniz bulunmamaktadır (403 Forbidden). Path: ${path}`);

      // Şirket değişimi sonrası token'daki eski claim'ler (denetlenenId mismatch) nedeniyle 403 alınabilir.
      // Cookie tabanlı auth'da browser otomatik refresh cookie'sini gönderir.
      const lowerPath = path.toLowerCase();
      if (typeof window !== "undefined" && lowerPath !== '/auth/refresh' && lowerPath !== '/auth/login') {
        console.log("ℹ️ 403 alındı, cookie tabanlı session yenilenmesi deneniyor...");

        try {
          const refreshResponse = await fetch(`${url.endsWith('/') ? url.slice(0, -1) : url}/Auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}), // Cookie kullanılacak
          });

          if (refreshResponse.ok) {
            console.log("✅ Session başarıyla yenilendi, istek tekrar deneniyor.");
            return await apiFetch(path, options);
          }
        } catch (refreshError) {
          console.error("❌ Session yenileme sırasında hata:", refreshError);
        }
      }

      // Kesinlikle yetki yoksa logout yap
      console.error("❌ Yetki hatası. Oturum kapatılıyor.");
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.localStorage.removeItem("persist:root");
        window.location.href = "/";
      }
    }

    return response;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Fetch aborted for:", path);
      // Tip güvenliği için obj döndürmek yerine hata fırlatalım
      throw new Error("İstek zaman aşımına uğradı veya iptal edildi.");
    }

    // 📝 Log error to file
    Logger.error(`API Fetch Error: ${path}`, error);

    const isConnectionError = error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError");
    const isUnauthorizedError = error.message === "Unauthorized - aborting request";

    if (isConnectionError) {
      console.error(`❌ API Bağlantı Hatası (${path}): Sisteme ulaşılamıyor. API servisinin çalıştığından emin olun.`);

      // Bağlantı hatası durumunda login'e yönlendirme Redux state'ine göre yönetilmeli.
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        // window.location.href = "/"; // Şimdilik agresif yönlendirme yapmıyoruz.
      }
    } else if (isUnauthorizedError) {
      // ⚠️ Token validasyonu başarısız oldu ama login'e yönlendirme YAPMA
      console.warn(`⚠️ API Yetkisiz Erişim (${path}): Token kontrolü başarısız. Sayfa reload sonrası normal düzelebilir.`);
    } else {
      console.error(`❌ API Hata (${path}):`, error.message);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
