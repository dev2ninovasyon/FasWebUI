export const url = "https://betaapi.fasmart.app/api";
//export const url = "https://localhost:5001/api";

export async function apiFetch(
  path: string,
  options: RequestInit & { timeout?: number; ignoreCustomHeaders?: boolean } = {}
) {
  const { headers, timeout = 120000, ignoreCustomHeaders = false, ...rest } = options;

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


  try {
    const requestStartTime = Date.now();


    const response = await fetch(fullUrl, {
      ...rest,
      headers: mergedHeaders,
      signal: controller.signal,
    });

    const duration = Date.now() - requestStartTime;


    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      const isTimeout = controller.signal.reason === "timeout";
    } else {
      //console.log(`âŒ [%cAPI Hata   %c] (${path}):`, 'color: #ef4444; font-weight: bold;', 'color: inherit;', error);
    }
    throw error;
  } finally {
  }
}
