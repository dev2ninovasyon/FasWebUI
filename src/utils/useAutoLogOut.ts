import { useDispatch, useSelector } from "@/store/hooks";
import { resetToNull, setToken, setRefreshToken } from "@/store/user/UserSlice";  // ✅ setRefreshToken import
import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { AppState } from "@/store/store";
import { apiFetch } from "@/api/apiBase";
import SecureTokenManager from "@/utils/SecureTokenManager";

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

  // ⬇️⬇️⬇️ YENİ: geri sayım logu için interval
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshCountdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  // console.log("Debug User:", user); // Debug için

  // ✅ YENİ: Backend'e logout notification gönder
  const notifyBackendLogout = useCallback(async () => {
    try {
      // HttpOnly cookie kullanımı nedeniyle token'ı artık localStorage'dan okumuyoruz.
      // Backend /Auth/logout uç noktasında cookie'leri temizleyecektir.
      await apiFetch('/Auth/logout', {
        method: 'POST',
        ignoreCustomHeaders: false,
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(err => {
        console.warn('⚠️ Backend logout notification başarısız (normal):', err.message);
      });
    } catch (error) {
      console.warn('⚠️ Backend logout notification error:', error);
    }
  }, []);

  // *** ÇIKIŞ ***
  const logout = useCallback(() => {
    // ✅ Backend'e logout bildir (JTI revocation için)
    notifyBackendLogout();

    // ✅ localStorage'dan tüm verileri temizle
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMEOUT_KEY);
    localStorage.removeItem("fas_denetlenenId");
    localStorage.removeItem("fas_yil");
    localStorage.removeItem("fas_blacklisted_tokens");

    dispatch(resetToNull(""));

    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (refreshCountdownTimerRef.current) clearInterval(refreshCountdownTimerRef.current);

    router.replace("/Login");
  }, [dispatch, router, notifyBackendLogout]);

  // idle timer reset
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current); // YENİ

    const expiry = Date.now() + idleTimeout;
    localStorage.setItem(TIMEOUT_KEY, expiry.toString());

    // Süre dolunca logout olacak timer
    idleTimerRef.current = setTimeout(() => {
      logout();
    }, idleTimeout);

    // ⬇️⬇️⬇️ Kalan süreyi sürekli konsola yazan interval (test için yorum satırı)
    countdownTimerRef.current = setInterval(() => {
      const remaining = expiry - Date.now();
      if (remaining <= 0) {
        clearInterval(countdownTimerRef.current!);
        countdownTimerRef.current = null;
        return;
      }

      const remainingSeconds = Math.ceil(remaining / 1000);
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
    }, 1000);
  }, [idleTimeout, logout]);

  // refresh token
  const refreshToken = useCallback(async () => {
    try {
      const response = await apiFetch(`/Auth/refresh`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // RefreshToken parametresi body'den kaldırıldı, cookie kullanılacak
      });

      if (!response.ok) {
        console.log("Refresh token yenilenemedi, response.ok=false");
        console.log("HTTP Status:", response.status);

        logout();
        return;
      }

      const data = await response.json();
      dispatch(setToken(data.token));  // Yeni access token
      if (data.refreshToken) {
        dispatch(setRefreshToken(data.refreshToken));
      }
    } catch (err) {
      console.log("Refresh token yenilenemedi (catch):", err);
      logout();
    }
  }, [dispatch, logout]);

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
