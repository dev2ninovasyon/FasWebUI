import { useDispatch, useSelector } from "@/store/hooks";
import { resetToNull, setToken } from "@/store/user/UserSlice";
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
        //console.log("Kalan süre: 0 sn");
        clearInterval(countdownTimerRef.current!);
        countdownTimerRef.current = null;
        return;
      }

      const remainingSeconds = Math.ceil(remaining / 1000);
      //console.log("Kalan süre:", remainingSeconds, "sn");
    }, 1000);
  }, [idleTimeout, logout]);

  // refresh token
  const refreshToken = useCallback(async () => {
    if (!user?.token) return;
    console.log("Token Yenilendi.");

    try {
      const response = await apiFetch(`/Auth/refresh`, {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: user.token || "" }),
      });

      if (!response.ok) {
        console.error("Refresh token yenilenemedi, response.ok=false");
        logout();
        return;
      }

      const data = await response.json();
      dispatch(setToken(data.token));
      //console.log("Refresh token yenilendi");
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
