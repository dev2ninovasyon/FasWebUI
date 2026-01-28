import { apiFetch } from "@/api/apiBase";

const handleBackendCall = async (token: string, endpoint: string, body: any, fallbackText: string) => {
  try {
    const response = await apiFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      if (response.status === 429 || errorData.includes("TooManyRequests") || errorData.includes("RESOURCE_EXHAUSTED")) {
        console.warn("Gemini API kotası doldu (429).");
        return fallbackText;
      }
      throw new Error(`API error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    // Backend returns IDataResult<string>, so we get result.data
    // Also handling PascalCase or Message field as fallback
    return result.data || result.Data || result.message || result.Message || fallbackText;
  } catch (error) {
    console.log(`Gemini API error (${endpoint}):`, error);
    return fallbackText;
  }
};

/**
 * Metin iyileştirme için kullanılır.
 */
export const enhanceText = async (user: any, text: string, instruction: string) => {
  return handleBackendCall(
    user.token,
    "/Gemini/EnhanceText",
    { text, instruction },
    text || "Lütfen önce bir tespit metni girin."
  );
};

/**
 * Ayarlarla birlikte metin iyileştirme.
 */
export const enhanceTextSettingWith = async (user: any, text: string, instruction: string) => {
  return handleBackendCall(user.token, "/Gemini/EnhanceText", { text, instruction }, text);
};

/**
 * Müşteri ekleme ekranında metin/URL analizi için kullanılır.
 */
export const enhanceTextMsuteriEkle = async (user: any, text: string, instruction: string) => {
  return handleBackendCall(
    user.token,
    "/Gemini/EnhanceText",
    { text, instruction },
    text || "Lütfen önce bir tespit metni girin."
  );
};

/**
 * URL'den şirket bilgisi çıkarmak için kullanılır.
 */
export const extractCompanyInfoFromUrl = async (user: any, url: string, instruction: string) => {
  return handleBackendCall(
    user.token,
    "/Gemini/ExtractFromUrl",
    { url, instruction },
    "İçerik işlenemedi veya bilgi bulunamadı."
  );
};

/**
 * Genel Gemini görevlerini çalıştırmak için kullanılır.
 */
export async function runTaskWithGemini(user: any, taskText: string, url?: string): Promise<string> {
  return handleBackendCall(
    user.token,
    "/Gemini/RunTask",
    { text: taskText, url },
    "Model görünür metin üretmedi."
  );
}
