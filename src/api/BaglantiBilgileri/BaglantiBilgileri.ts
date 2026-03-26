/**
 * BaglantiBilgileri API Module - Refactored
 * 
 * ⚠️ BREAKING CHANGE: Connection management moved to useBildirimConnection hook
 * 
 * This file now contains ONLY:
 * - API functions for BaglantiBilgileri endpoints
 * - Type definitions
 * 
 * For SignalR connection management, use:
 * @see {@link @/hooks/useBildirimConnection} - useBildirimConnection hook
 */

import { apiFetch } from "@/api/apiBase";
import type {
  BaglantiBilgileriData,
  BildirimEvent,
} from "./BaglantiBilgileri.types";

/**
 * Fetch connection information by multiple parameters
 */
export const getBaglantiBilgileri = async (
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number
): Promise<BaglantiBilgileriData | null> => {
  try {
    const response = await apiFetch(
      `/BaglantiBilgileri/BaglantiBilgileri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response && response.ok) {
      return response.json();
    } else {
      const errorData = await response?.json().catch(() => null);
      const errorMessage = errorData?.message || "Bağlantı Bilgileri bulunamadı";
      if (response?.status === 404) {
        console.warn("Bağlantı bilgisi yok:", errorMessage);
      } else {
        console.warn(errorMessage);
      }
      return null;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return null;
  }
};

export const getBaglantiBilgileriByTip = async (
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number,
  tip: string
): Promise<BaglantiBilgileriData | null> => {
  try {
    const response = await apiFetch(
      `/BaglantiBilgileri/BaglantiBilgileriByTip?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}&tip=${tip}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response && response.ok) {
      return response.json();
    } else {
      const errorData = await response?.json().catch(() => null);
      const errorMessage = errorData?.message || "Bağlantı Bilgileri bulunamadı";
      if (response?.status === 404) {
        console.warn("Bağlantı bilgisi yok:", errorMessage);
      } else {
        console.warn(errorMessage);
      }
      return null;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return null;
  }
};

export const getBaglantiBilgileriByLink = async (
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number,
  link: string
): Promise<BaglantiBilgileriData | null> => {
  try {
    const response = await apiFetch(
      `/BaglantiBilgileri/BaglantiBilgileriByLink?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}&link=${link}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response && response.ok) {
      return response.json();
    } else {
      const errorData = await response?.json().catch(() => null);
      const errorMessage = errorData?.message || "Bağlantı Bilgileri bulunamadı";
      if (response?.status === 404) {
        console.warn("Bağlantı bilgisi yok:", errorMessage);
      } else {
        console.warn(errorMessage);
      }
      return null;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return null;
  }
};

export const createBaglantiBilgileri = async (
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number,
  tip: string,
  kaynakUrl?: string
): Promise<boolean> => {
  try {
    const response = await apiFetch(
      `/BaglantiBilgileri/BaglantiBilgileri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}&tip=${tip}${
        kaynakUrl ? `&kaynakUrl=${encodeURIComponent(kaynakUrl)}` : ""
      }`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

export const deleteBaglantiBilgileri = async (
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number
): Promise<boolean> => {
  try {
    const response = await apiFetch(
      `/BaglantiBilgileri/BaglantiBilgileri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

export const deleteBaglantiBilgileriById = async (
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number,
  id: number
): Promise<boolean> => {
  try {
    const response = await apiFetch(
      `/BaglantiBilgileri/BaglantiBilgileriById?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}&id=${id}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

export const getBildirimler = async (denetciId: number): Promise<BildirimEvent[] | null> => {
  try {
    const response = await apiFetch(
      `/BaglantiBilgileri/Bildirimler?denetciId=${denetciId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("Bildirimler getirilemedi");
      return null;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return null;
  }
};

export const updateBildirimlerOkundumu = async (ids: number[]): Promise<boolean> => {
  try {
    const response = await apiFetch(
      `/BaglantiBilgileri/BildirimlerOkundumu`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ids),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

// Export types
export type * from "./BaglantiBilgileri.types";

/**
 * DEPRECATED EXPORTS - Use useBildirimConnection hook instead
 * These are kept for backwards compatibility only
 * 
 * @deprecated Use useBildirimConnection hook from @/hooks/useBildirimConnection
 */

export const testSignalRConnection = async (): Promise<boolean> => {
  console.warn(
    "⚠️ testSignalRConnection is deprecated. Use useBildirimConnection().testConnection() instead."
  );
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "");
    const response = await fetch(`${baseUrl}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return response !== null;
  } catch {
    return false;
  }
};

/**
 * @deprecated Use useBildirimConnection hook
 */
export const startBildirimConnection = async (denetciId: number) => {
  console.warn(
    "⚠️ startBildirimConnection is deprecated. Use useBildirimConnection hook.\n" +
      `Example: const { startConnection } = useBildirimConnection({ denetciId: ${denetciId} })`
  );
  return null;
};

/**
 * @deprecated Use useBildirimConnection hook
 */
export const onYeniBildirim = (callback: any, denetciId?: number) => {
  console.warn(
    "⚠️ onYeniBildirim is deprecated. Use useBildirimConnection hook.\n" +
      `Example:\nconst { registerCallback } = useBildirimConnection({ denetciId: ${denetciId} })\n` +
      "registerCallback(callback)"
  );
};

/**
 * @deprecated Use useBildirimConnection hook
 */
export const stopBildirimConnection = async () => {
  console.warn("⚠️ stopBildirimConnection is deprecated. Use useBildirimConnection().stopConnection()");
};

/**
 * @deprecated Use useBildirimConnection hook
 */
export const startPollingBildirim = (denetciId: number, callback: any) => {
  console.warn(
    "⚠️ startPollingBildirim is deprecated. Use useBildirimConnection hook - polling is automatic."
  );
};

/**
 * @deprecated Use useBildirimConnection hook
 */
export const stopPollingBildirim = () => {
  console.warn(
    "⚠️ stopPollingBildirim is deprecated. Use useBildirimConnection().stopConnection()"
  );
};

/**
 * @deprecated Use useBildirimConnection hook
 */
export const getBildirimConnectionStatus = () => {
  console.warn(
    "⚠️ getBildirimConnectionStatus is deprecated. Use useBildirimConnection for state."
  );
  return {
    signalRConnected: false,
    signalRState: "Unknown",
    pollingActive: false,
    listenerRegistered: false,
    hasCallback: false,
  };
};
