//export const url = "https://betaapi.fasmart.app/api";
export const url = "https://localhost:5001/api";

export async function apiFetch(
  path: string,
  options: RequestInit & { timeout?: number } = {}
) {
  const { headers, timeout = 30000, ...rest } = options;

  const clientUrl =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "";

  let denetlenenIdFromStorage: string | null = null;
  let yilFromStorage: string | null = null;

  if (typeof window !== "undefined") {
    try {
      denetlenenIdFromStorage = window.localStorage.getItem("fas_denetlenenId");
      yilFromStorage = window.localStorage.getItem("fas_yil");
    } catch (e) {
      console.warn("fas_denetlen2enId / fas_yil localStorage'dan okunamadı:", e);
    }
  }

  const mergedHeaders: HeadersInit = {
    ...(headers || {}),            // 🔹 Buradaki Authorization'ı olduğu gibi bırak
    "X-Client-Url": clientUrl,
    ...(denetlenenIdFromStorage
      ? { "X-Denetlenen-Id": denetlenenIdFromStorage }
      : {}),
    ...(yilFromStorage ? { "X-Yil": yilFromStorage } : {}),
  };

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout); // Custom timeout veya varsayılan 30 saniye

  try {
    const response = await fetch(`${url}${normalizedPath}`, {
      ...rest,
      headers: mergedHeaders,
      signal: controller.signal,
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn(`Request to ${path} was aborted (timeout or cancelled).`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
