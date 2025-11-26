// src/api/apiBase.ts
export const url = "https://beta.fasweb.com.tr/api";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const { headers, ...rest } = options;

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
      console.warn("fas_denetlenenId / fas_yil localStorage'dan okunamadı:", e);
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
  return fetch(`${url}${normalizedPath}`, {
    ...rest,
    headers: mergedHeaders,
  });
}
