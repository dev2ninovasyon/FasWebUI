//export const url = "https://betaapi.fasmart.app/api";
export const url = "https://localhost:5001/api";

export async function apiFetch(
  path: string,
  options: RequestInit & { timeout?: number; ignoreCustomHeaders?: boolean } = {}
) {
  const { headers, timeout = 30000000, ignoreCustomHeaders = false, ...rest } = options;

  const clientUrl =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "";

  let denetlenenIdFromStorage: string | null = null;
  let yilFromStorage: string | null = null;

  if (typeof window !== "undefined" && !ignoreCustomHeaders) {
    try {
      denetlenenIdFromStorage = window.localStorage.getItem("fas_denetlenenId");
      yilFromStorage = window.localStorage.getItem("fas_yil");
    } catch (e) {
      console.warn("fas_denetlenenId / fas_yil localStorage'dan okunamadı:", e);
    }
  }

  const mergedHeaders: HeadersInit = {
    ...(headers || {}),
    "X-Client-Url": clientUrl,
    ...(!ignoreCustomHeaders && denetlenenIdFromStorage
      ? { "X-Denetlenen-Id": denetlenenIdFromStorage }
      : {}),
    ...(!ignoreCustomHeaders && yilFromStorage ? { "X-Yil": yilFromStorage } : {}),
  };

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${url.endsWith('/') ? url.slice(0, -1) : url}${normalizedPath}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    const timeoutMsg = `âš ï¸ API Timeout: ${fullUrl} (${timeout}ms süresini aştı)`;
    console.error(timeoutMsg);
    controller.abort("timeout");
  }, timeout);

  try {
    const requestStartTime = Date.now();
    console.log(`ğŸŒ [%cAPI İstek %c] %c${fullUrl}`, 'color: #3b82f6; font-weight: bold;', 'color: inherit;', 'color: #10b981;', {
      method: rest.method || 'GET',
      headers: mergedHeaders,
      body: rest.body
    });

    const response = await fetch(fullUrl, {
      ...rest,
      headers: mergedHeaders,
      signal: controller.signal,
    });

    const duration = Date.now() - requestStartTime;
    console.log(`âœ… [%cAPI Yanıt %c] %c${fullUrl} %c(${duration}ms)`, 'color: #10b981; font-weight: bold;', 'color: inherit;', 'color: #3b82f6;', 'color: #6b7280;', {
      status: response.status,
      statusText: response.statusText
    });

    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      const isTimeout = controller.signal.reason === "timeout";
      console.warn(`ğŸ›‘ [%cAPI Hata   %c] ${path} -> ${isTimeout ? 'TIMED OUT' : 'CANCELLED'}.`, 'color: #ef4444; font-weight: bold;', 'color: inherit;');
    } else {
      console.error(`âŒ [%cAPI Hata   %c] (${path}):`, 'color: #ef4444; font-weight: bold;', 'color: inherit;', error);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
