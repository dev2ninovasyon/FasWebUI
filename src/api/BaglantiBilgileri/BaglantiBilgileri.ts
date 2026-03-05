import { apiFetch, url as apiBaseUrl } from "@/api/apiBase";
import SecureTokenManager from "@/utils/SecureTokenManager";
import { HubConnectionBuilder, LogLevel, HubConnectionState } from "@microsoft/signalr";

let hubConnection: any = null;
let startConnectionPromise: Promise<any> | null = null;
let pollingInterval: NodeJS.Timeout | null = null;
let lastNotificationTime = new Date();
let notificationCallback: ((bildirim: any) => void) | null = null;
let listenerRegistered = false;
let pollingToken: string | null = null;
let pollingDenetciId: number | null = null;

const getSignalRToken = () => {
  if (typeof window === "undefined") {
    return SecureTokenManager.getAccessToken() || "";
  }

  return SecureTokenManager.getAccessToken() || "";
};

// Hot reload cleanup: In development, ensure old connections are cleaned up on module reload
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const globalBaglanti = (window as any).__baglantiBilgileriCleanup;
  if (globalBaglanti && typeof globalBaglanti === 'function') {
    globalBaglanti();
  }

  // Register this module's cleanup function
  (window as any).__baglantiBilgileriCleanup = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    if (hubConnection) {
      try {
        hubConnection.stop().catch(() => { });
        hubConnection = null;
      } catch (e) { }
    }
    listenerRegistered = false;
    notificationCallback = null;
  };
}

// API URL'ini apiBase'den al
const getApiUrl = () => {
  // apiBaseUrl: "https://betaapi.fasmart.app/api" formatında geliyor. 
  // SignalR için "/api" kısmını temizlememiz gerekebiliyor bazen (hub isminde varsa), 
  // ama hub adresi api url'i üzerine ekleniyor.
  // /api kısmını kaldırarak ana domaini alalım:
  return apiBaseUrl.replace(/\/api$/, "").replace(/\/$/, "");
};

// Bağlantı test et (fetch ile HTTPS sorunlarını handle et)
export const testSignalRConnection = async () => {
  try {
    const apiUrl = getApiUrl();
    const testUrl = `${apiUrl}/api/health`;

    // console.log("SignalR bağlantı testi:", testUrl);

    // Timeout ile fetch yapıyoruz
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(testUrl, {
      method: "GET",
      signal: controller.signal,
    }).catch(e => {
      console.error("Health check hatası:", e.message);
      return null;
    }).finally(() => clearTimeout(timeoutId));

    if (response?.ok) {
      return true;
    } else {
      console.error("⚠️ Backend yanıt verdi ama hata kodu:", response?.status);
      // 4xx/5xx dönse de backend'in çalışıyor demektir
      return response !== null;
    }
  } catch (error) {
    console.error("Test hatası:", error instanceof Error ? error.message : error);
    return false;
  }
};

// Fallback: Polling ile bildirimleri al
let pollCallback: ((bildirim: any) => void) | null = null;

export const startPollingBildirim = (denetciId: number, callback: (bildirim: any) => void) => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }

  pollCallback = callback;
  // Polling başlarken şu anki zamanı set et, böylece eski bildirimleri göstermez
  lastNotificationTime = new Date();

  // İlk çalışmayı hemen yap
  const checkNotifications = async () => {
    try {
      const bildirimler = await getBildirimler(denetciId);

      if (bildirimler && Array.isArray(bildirimler)) {
        for (const bildirim of bildirimler) {
          const bildirimTarihi = new Date(bildirim.tarih || new Date());

          // Yalnız son kontrol tarihinden sonra gelen bildirimleri gönder
          if (bildirimTarihi > lastNotificationTime && !bildirim.okundumu) {
            pollCallback?.(bildirim);
            lastNotificationTime = new Date();
          }
        }
      }
    } catch (error) {
      console.error("❌ Polling hatası:", error);
    }
  };

  // İlk kez hemen çalıştır
  checkNotifications();

  // Sonra her 5 saniyede çalıştır
  pollingInterval = setInterval(checkNotifications, 5000);
};

export const stopPollingBildirim = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

export const startBildirimConnection = async (denetciId: number) => {
  // Polling için token ve denetciId'yi kaydet (fallback için)
  pollingToken = getSignalRToken();
  pollingDenetciId = denetciId;

  if (hubConnection && hubConnection.state === HubConnectionState.Connected) {
    console.log("SignalR zaten bağlı, tekrar bağlanmıyor");
    return hubConnection;
  }

  if (startConnectionPromise) {
    return startConnectionPromise;
  }

  startConnectionPromise = (async () => {
    const apiUrl = getApiUrl();
    const hubUrl = `${apiUrl}/bildirim-hub`;

    const signalRToken = getSignalRToken();
    // console.log("DenetçiId:", denetciId);

    // Use lighter reconnect strategy in development to save memory
    const reconnectStrategy = process.env.NODE_ENV === 'development'
      ? [0, 5000, 10000] // Dev: lighter strategy
      : [0, 2000, 5000, 10000, 30000]; // Prod: full strategy

    hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getSignalRToken(),
        withCredentials: true,
        // ⚠️ skipNegotiation: true ve transport: WebSockets zorlaması CORS/Proxy sorunlarına yol açabilir.
        // SignalR'ın en iyi transportu (WebSockets, Server-Sent Events, Long Polling) otomatik seçmesine izin verin.
      })
      .withAutomaticReconnect(reconnectStrategy)
      .configureLogging(process.env.NODE_ENV === 'development' ? LogLevel.Warning : LogLevel.Information)
      .build();
    const activeConnection = hubConnection;

    // Listener'ı bağlantı kurulmadan ÖNCE kaydet
    // Bu sayede bağlantı kurulduktan hemen sonra mesajlar alınabilir
    if (notificationCallback && !listenerRegistered) {
      activeConnection.on("YeniBildirim", notificationCallback);
      listenerRegistered = true;
    }

    // Bağlantı olaylarını dinle
    activeConnection.onreconnecting((error: Error | undefined) => {
      console.warn("⚠️ SignalR yeniden bağlanmaya çalışıyor...", error);
    });

    activeConnection.onreconnected((connectionId: string | undefined) => {
      console.log("✅ SignalR yeniden bağlandı:", connectionId);
      // Listener zaten kayıtlı olduğundan tekrar kaydetmeye gerek yok
      // SignalR otomatik olarak listener'ları korur
    });

    activeConnection.onclose((error: Error | undefined) => {
      if (hubConnection === activeConnection) {
        hubConnection = null;
      }
      listenerRegistered = false;

      // Bağlantı kapanınca sessizce polling'e geçmeyi dene
      if (pollingToken && pollingDenetciId && notificationCallback) {
        startPollingBildirim(pollingDenetciId, notificationCallback);
      }
    });

    // console.log("🔌 SignalR bağlantısı kuruluyor...");
    await activeConnection.start();

    if (activeConnection.state !== HubConnectionState.Connected) {
      throw new Error("SignalR bağlantısı start sonrası Connected durumunda değil.");
    }

    if (activeConnection.state === HubConnectionState.Connected) {
      await activeConnection.invoke("JoinDenetciGroup", denetciId);
    } else {
      const stateValue = activeConnection.state;
      const stateMap: { [key: number]: string } = {
        0: "Disconnected",
        1: "Connected",
        2: "Connecting",
        3: "Reconnecting",
      };
      throw new Error(`Bağlantı durumu hatalı: ${stateMap[stateValue] || `Unknown(${stateValue})`}`);
    }

    // Polling'i durdur (SignalR aktif oldu)
    stopPollingBildirim();

    return activeConnection;

  })().catch(async (error) => {
    console.error("❌ SignalR bağlantı hatası:", error);

    // Detaylı hata bilgisi
    if (error instanceof Error) {
      console.error("Hata mesajı:", error.message);
      console.error("Stack trace ilk satır:", error.stack?.split('\n')[0]);
    }

    const message = error instanceof Error ? error.message : String(error || "");
    const stoppedDuringNegotiation = message.includes("stopped during negotiation");

    // Hata kodu için bağlantıyı kapat ama null'a setleme
    try {
      if (hubConnection) {
        await hubConnection.stop();
      }
    } catch (stopError) {
      console.error("Bağlantı durdurma hatası:", stopError);
    }

    hubConnection = null;
    listenerRegistered = false;

    throw error;
  }).finally(() => {
    startConnectionPromise = null;
  });

  return startConnectionPromise;
};

export const onYeniBildirim = (callback: (bildirim: any) => void, denetciId?: number) => {
  // Callback'i global değişkene kaydet
  notificationCallback = callback;

  // Eğer hubConnection oluşturulmuşsa listener'ı ekle
  if (hubConnection) {
    // Eski listener'ı temizle (mükerrerliği önlemek için)
    hubConnection.off("YeniBildirim");
    hubConnection.on("YeniBildirim", callback);
    listenerRegistered = true;
  } 

  // SignalR bağlanana kadar veya hata verirse polling'i hazırla
  if (denetciId && (!hubConnection || hubConnection.state !== HubConnectionState.Connected)) {
    startPollingBildirim(denetciId, callback);
  }
};

export const stopBildirimConnection = async () => {
  if (hubConnection) {
    try {
      await hubConnection.stop();
      hubConnection = null;
      listenerRegistered = false;
    } catch (error) {
      // console.log("SignalR kapatma hatası:", error);
    }
  }
};

export const getBildirimConnectionStatus = () => {
  const stateMap: { [key: number]: string } = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Reconnecting",
  };

  const connectionState = hubConnection?.state;
  const stateName = connectionState !== undefined
    ? stateMap[connectionState] || `Unknown(${connectionState})`
    : 'null (no connection)';

  const isPollingActive = pollingInterval !== null;

  return {
    signalRConnected: hubConnection && hubConnection.state === HubConnectionState.Connected,
    signalRState: stateName,
    pollingActive: isPollingActive,
    listenerRegistered,
    hasCallback: notificationCallback !== null,
  };
};

export const getBaglantiBilgileri = async (
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number
) => {
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
    if (response.ok) {
      return response.json();
    } else {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || "Bağlantı Bilgileri getirilemedi";
      console.log(errorMessage);
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getBaglantiBilgileriByTip = async (
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number,
  tip: string
) => {
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
    if (response.ok) {
      return response.json();
    } else {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || "Bağlantı Bilgileri getirilemedi";
      console.log(errorMessage);
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getBaglantiBilgileriByLink = async (
  link: string
) => {
  try {
    const response = await apiFetch(
      `/BaglantiBilgileri/BaglantiBilgileriByLink?link=${encodeURIComponent(link)}`,
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
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || "Bağlantı Bilgileri getirilemedi";
      console.log(errorMessage);
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createBaglantiBilgileri = async (
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number,
  tip: string,
  kaynakUrl?: string
) => {
  try {
    const response = await apiFetch(
      `/BaglantiBilgileri/BaglantiBilgileri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}&tip=${tip}${kaynakUrl ? `&kaynakUrl=${encodeURIComponent(kaynakUrl)}` : ""}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteBaglantiBilgileri = async (
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number
) => {
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

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteBaglantiBilgileriById = async (
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number,
  id: number
) => {
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

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getBildirimler = async (denetciId: number) => {
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
      console.log("Bildirimler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateBildirimlerOkundumu = async (
  ids: number[]
) => {
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

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
