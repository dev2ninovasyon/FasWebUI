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
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current); // YENİ

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

    // ⬇⬇⬇ YENİ: kalan süreyi sürekli konsola yazan interval
    countdownTimerRef.current = setInterval(() => {
      const remaining = expiry - Date.now();
      if (remaining <= 0) {
        // console.log("⏰ Kalan süre: 0 sn - LOGOUT!");
        clearInterval(countdownTimerRef.current!);
        countdownTimerRef.current = null;
        return;
      }

      const remainingSeconds = Math.ceil(remaining / 1000);
      // console.log(`⏰ Idle timeout'a kalan süre: ${remainingSeconds} saniye`);
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
          refreshToken: user.refreshToken  // ✅ Güvenli: refreshToken gönderiliyor
        }),
      });

      if (!response.ok) {
        console.error("Refresh token yenilenemedi, response.ok=false");
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
  }, [user?.token, dispatch, logout]);

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

    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = setInterval(() => {
      refreshToken();
    }, refreshInterval);

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current); // YENİ
    };
  }, [user?.token, resetIdleTimer, refreshToken, refreshInterval]);

  return null;
}
