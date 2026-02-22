import { apiFetch, url as apiBaseUrl } from "@/api/apiBase";
import SecureTokenManager from "@/utils/SecureTokenManager";
import { HubConnectionBuilder, HttpTransportType, LogLevel, HubConnectionState } from "@microsoft/signalr";

let hubConnection: any = null;
let pollingInterval: NodeJS.Timeout | null = null;
let lastNotificationTime = new Date();
let notificationCallback: ((bildirim: any) => void) | null = null;
let listenerRegistered = false;
let pollingToken: string | null = null;
let pollingDenetciId: number | null = null;

// Hot reload cleanup: In development, ensure old connections are cleaned up on module reload
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const globalBaglanti = (window as any).__baglantiBilgileriCleanup;
  if (globalBaglanti && typeof globalBaglanti === 'function') {
    console.log("🧹 Cleaning up stale BaglantiBilgileri connections from previous hot reload");
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

    console.log("SignalR bağlantı testi:", testUrl);

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
      console.log("✅ Backend erişilebilir:", response.status);
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
  console.log("📡 Polling modu başlatıldı (her 5 saniyede kontrol)");

  pollCallback = callback;
  // Polling başlarken şu anki zamanı set et, böylece eski bildirimleri göstermez
  lastNotificationTime = new Date();

  // İlk çalışmayı hemen yap
  const checkNotifications = async () => {
    try {
      const bildirimler = await getBildirimler(denetciId);

      if (bildirimler && Array.isArray(bildirimler)) {
        console.log(`📊 API'den ${bildirimler.length} bildirim alındı`);

        for (const bildirim of bildirimler) {
          const bildirimTarihi = new Date(bildirim.tarih || new Date());

          console.log(
            `  Kontrol: "${bildirim.konu}" | Tarih: ${bildirimTarihi.toISOString()} | Okundu: ${bildirim.okundumu} | Yeni mi: ${bildirimTarihi > lastNotificationTime && !bildirim.okundumu}`
          );

          // Yalnız son kontrol tarihinden sonra gelen bildirimleri gönder
          if (bildirimTarihi > lastNotificationTime && !bildirim.okundumu) {
            console.log("✅ YENİ BİLDİRİM - Callback çağrılıyor:", bildirim.konu);
            pollCallback?.(bildirim);
            lastNotificationTime = new Date();
          }
        }
      } else {
        console.log("⚠️ API bildirim listesi boş veya array değil");
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
    console.log("📡 Polling modu durduruldu");
  }
};

export const startBildirimConnection = async (denetciId: number) => {
  // Polling için token ve denetciId'yi kaydet (fallback için)
  pollingToken = SecureTokenManager.getAccessToken() || "";
  pollingDenetciId = denetciId;

  if (hubConnection && hubConnection.state === HubConnectionState.Connected) {
    console.log("SignalR zaten bağlı, tekrar bağlanmıyor");
    return hubConnection;
  }

  let connection: any = null;
  try {
    const apiUrl = getApiUrl();
    const hubUrl = `${apiUrl}/bildirim-hub`;

    console.log("🔌 SignalR bağlantısı başlatılıyor:", hubUrl);
    // console.log("Token:", token?.substring(0, 20) + "...");
    console.log("DenetçiId:", denetciId);

    // Use lighter reconnect strategy in development to save memory
    const reconnectStrategy = process.env.NODE_ENV === 'development'
      ? [0, 5000, 10000] // Dev: lighter strategy
      : [0, 2000, 5000, 10000, 30000]; // Prod: full strategy

    connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => SecureTokenManager.getAccessToken() || "",
      })
      .withAutomaticReconnect(reconnectStrategy)
      .configureLogging(process.env.NODE_ENV === 'development' ? LogLevel.Warning : LogLevel.Information)
      .build();

    hubConnection = connection;

    // Listener'ı bağlantı kurulmadan ÖNCE kaydet
    if (notificationCallback && !listenerRegistered) {
      console.log("✅ YeniBildirim listener kaydediliyor (bağlantı öncesi)");
      connection.on("YeniBildirim", notificationCallback);
      listenerRegistered = true;
    }

    // Bağlantı olaylarını dinle
    connection.onreconnecting((error: Error | undefined) => {
      console.warn("⚠️ SignalR yeniden bağlanmaya çalışıyor...", error);
    });

    connection.onreconnected((connectionId: string | undefined) => {
      console.log("✅ SignalR yeniden bağlandı:", connectionId);
    });

    connection.onclose((error: Error | undefined) => {
      console.warn("❌ SignalR bağlantısı kapandı:", error);
      if (hubConnection === connection) {
        hubConnection = null;
        listenerRegistered = false;
      }

      // Bağlantı kapanınca polling'e geç
      if (pollingToken && pollingDenetciId && notificationCallback) {
        console.log("🔄 SignalR bağlantısı koptu, polling'e geçiliyor...");
        startPollingBildirim(pollingDenetciId, notificationCallback);
      }
    });

    console.log("🔌 SignalR bağlantısı kuruluyor...");
    await connection.start();

    // 🛡️ CRITICAL FIX: Ensure connection wasn't closed/nulled during await
    if (!hubConnection || hubConnection !== connection) {
      console.warn("⚠️ SignalR bağlantı işlemi sırasında kapatıldı veya değiştirildi.");
      return connection;
    }

    console.log("✅ SignalR bağlantısı başarılı! Grup katılımı yapılıyor...");
    if (connection.connectionId) {
      console.log("📡 Connection ID:", connection.connectionId);
    }

    if (connection.state === HubConnectionState.Connected) {
      console.log("✅ Bağlantı durumu: Connected");
      await connection.invoke("JoinDenetciGroup", denetciId);
      console.log("✅ SignalR bağlantısı başarılı ve gruba katılım yapıldı!");
    } else {
      const stateValue = connection.state;
      const stateMap: Record<number, string> = {
        0: "Disconnected",
        1: "Connected",
        2: "Reconnecting",
      };
      throw new Error(`Bağlantı durumu hatalı: ${stateMap[Number(stateValue)] || `Unknown(${stateValue})`}`);
    }

    // Polling'i durdur (SignalR aktif oldu)
    stopPollingBildirim();

    return connection;
  } catch (error) {
    console.error("❌ SignalR bağlantı hatası:", error);

    // Detaylı hata bilgisi
    if (error instanceof Error) {
      console.error("Hata mesajı:", error.message);
      console.error("Stack trace ilk satır:", error.stack?.split('\n')[0]);
    }

    // Hata kodu için bağlantıyı kapat
    try {
      if (connection) {
        await connection.stop();
      }
    } catch (stopError) {
      console.error("Bağlantı durdurma hatası:", stopError);
    }

    if (hubConnection === connection) {
      hubConnection = null;
      listenerRegistered = false;
    }

    // SignalR başarısız oldu, polling'i başlat
    console.warn("⚠️ SignalR başarısız, polling fallback'ine geçiliyor...");

    throw error;
  }
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
    console.log(`✅ YeniBildirim listener ${hubConnection.state === HubConnectionState.Connected ? 'aktif' : 'bağlantı kurulduğunda aktif olacak'}`);
  } else {
    console.warn("⚠️ Hub henüz oluşturulmadı, callback kaydedildi.");
  }

  // SignalR bağlanana kadar veya hata verirse polling'i hazırla
  if (denetciId && (!hubConnection || hubConnection.state !== HubConnectionState.Connected)) {
    console.log("🔄 SignalR henüz aktif değil, polling hazırda bekletiliyor...");
    startPollingBildirim(denetciId, callback);
  }
};

export const stopBildirimConnection = async () => {
  if (hubConnection) {
    try {
      await hubConnection.stop();
      hubConnection = null;
      listenerRegistered = false;
      console.log("SignalR bağlantısı kesildi");
    } catch (error) {
      console.log("SignalR kapatma hatası:", error);
    }
  }
};

export const getBildirimConnectionStatus = () => {
  const stateMap: { [key: number]: string } = {
    0: "Disconnected",
    1: "Connected",
    2: "Reconnecting",
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
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number,
  link: string
) => {
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
