import { useDispatch, useSelector } from "@/store/hooks";
import { resetToNull, setToken, setRefreshToken } from "@/store/user/UserSlice";  // ✅ setRefreshToken import
import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { AppState } from "@/store/store";
import { apiFetch } from "@/api/apiBase";

const STORAGE_KEY = "user";
const TIMEOUT_KEY = "user_expiry";

export default function useAutoLogout(
  idleTimeout: number,     // kullanıcı inaktifse logout süresi (ms)
  refreshInterval: number  // token yenileme süresi (ms)
) {
  const dispatch = useDispatch();
  const router = useRouter();
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ⬇⬇⬇ YENİ: geri sayım log’u için interval
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshCountdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  // console.log("Debug User:", user); // Debug için


  // *** ÇIKIŞ ***
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMEOUT_KEY);
    // Şirket seçimi bilgilerini de temizle
    localStorage.removeItem("fas_denetlenenId");
    localStorage.removeItem("fas_yil");
    dispatch(resetToNull(""));

    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (refreshCountdownTimerRef.current) clearInterval(refreshCountdownTimerRef.current);

    router.replace("/Login");
  }, [dispatch, router]);

  // idle timer reset
  const resetIdleTimer = useCallback(() => {
    // test log’ları
    //console.log("idleTimeout (ms):", idleTimeout);
    //console.log("idleTimeout (dk):", idleTimeout / 60000);

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current); // YENİ

    const expiry = Date.now() + idleTimeout;
    localStorage.setItem(TIMEOUT_KEY, expiry.toString());

    // Süre dolunca logout olacak timer
    idleTimerRef.current = setTimeout(() => {
      logout();
    }, idleTimeout);

    // ⬇⬇⬇ Kalan süreyi sürekli konsola yazan interval (test için yorum satırı)
    countdownTimerRef.current = setInterval(() => {
      const remaining = expiry - Date.now();
      if (remaining <= 0) {
        // console.log("⏰ Kalan süre: 0 sn - LOGOUT!");
        clearInterval(countdownTimerRef.current!);
        countdownTimerRef.current = null;
        return;
      }

      const remainingSeconds = Math.ceil(remaining / 1000);
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      // console.log(`⏰ Idle timeout'a kalan süre: ${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
  }, [idleTimeout, logout]);

  // refresh token
  const refreshToken = useCallback(async () => {
    if (!user?.refreshToken) {  // ✅ refreshToken kontrolü
      console.warn("Refresh token bulunamadı, logout yapılıyor");
      logout();
      return;
    }
    console.log("Token yenileniyor...");

    try {
      const response = await apiFetch(`/Auth/refresh`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          RefreshToken: user.refreshToken  // ✅ Backend PascalCase bekliyor
        }),
      });

      if (!response.ok) {
        console.error("Refresh token yenilenemedi, response.ok=false");
        console.error("HTTP Status:", response.status);
        console.error("Status Text:", response.statusText);

        // Backend'den gelen hata mesajını göster
        try {
          const errorData = await response.json();
          console.error("Backend Error:", errorData);
        } catch (e) {
          console.error("Response body okunamadı");
        }

        logout();
        return;
      }

      const data = await response.json();
      dispatch(setToken(data.token));  // Yeni access token
      if (data.refreshToken) {  // ✅ Yeni refresh token varsa kaydet
        dispatch(setRefreshToken(data.refreshToken));
      }
      // console.log("✅ Token başarıyla yenilendi!");
    } catch (err) {
      console.error("Refresh token yenilenemedi (catch):", err);
      logout();
    }
  }, [user?.token, user?.refreshToken, dispatch, logout]);

  useEffect(() => {
    if (!user?.token) return;

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
    ];

    events.forEach((event) => window.addEventListener(event, resetIdleTimer));
    resetIdleTimer();

    // Token yenileme zamanlayıcısı
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    if (refreshCountdownTimerRef.current) clearInterval(refreshCountdownTimerRef.current);

    const refreshExpiry = Date.now() + refreshInterval;

    refreshTimerRef.current = setInterval(() => {
      refreshToken();
      // Yeni çevrim başlatılıyor, geri sayımı sıfırla
      const newRefreshExpiry = Date.now() + refreshInterval;
      if (refreshCountdownTimerRef.current) clearInterval(refreshCountdownTimerRef.current);
      refreshCountdownTimerRef.current = setInterval(() => {
        const remaining = newRefreshExpiry - Date.now();
        if (remaining <= 0) {
          clearInterval(refreshCountdownTimerRef.current!);
          return;
        }
        const remainingSeconds = Math.ceil(remaining / 1000);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        // console.log(`🔄 Token yenilemeye kalan süre: ${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }, refreshInterval);

    // İlk geri sayımı başlat (test için yorum satırı)
    refreshCountdownTimerRef.current = setInterval(() => {
      const remaining = refreshExpiry - Date.now();
      if (remaining <= 0) {
        clearInterval(refreshCountdownTimerRef.current!);
        return;
      }
      const remainingSeconds = Math.ceil(remaining / 1000);
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      // console.log(`🔄 Token yenilemeye kalan süre: ${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (refreshCountdownTimerRef.current) clearInterval(refreshCountdownTimerRef.current);
    };
  }, [user?.token, resetIdleTimer, refreshToken, refreshInterval]);

  return null;
}
