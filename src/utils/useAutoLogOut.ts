import { useDispatch, useSelector } from "@/store/hooks";
import { resetToNull, setToken, setRefreshToken } from "@/store/user/UserSlice";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback, useState } from "react";
import { AppState } from "@/store/store";
import { apiFetch } from "@/api/apiBase";
import {
  LOGOUT_INTENT_KEY,
  buildRefreshRequestBody,
  clearClientAuthStorage,
  persistSessionTokens as persistAuthSessionTokens,
  readStoredAuthTokens,
} from "@/utils/authSession";

const STORAGE_KEY = "user";
const TIMEOUT_KEY = "user_expiry";

interface UseAutoLogoutReturn {
  showWarning: boolean;
  secondsBeforeLogout: number;
  onKeepSession: () => void;
  onLogout: () => void;
}

interface UseAutoLogoutOptions {
  enabled?: boolean;
}

export default function useAutoLogout(
  idleTimeout: number,     // kullanıcı inaktifse logout süresi (ms)
  refreshInterval: number, // token yenileme süresi (ms)
  warningShowBefore: number = 60 * 1000, // Logout'tan kaç ms önce uyarı göster
  options: UseAutoLogoutOptions = {}
): UseAutoLogoutReturn {
  const dispatch = useDispatch();
  const router = useRouter();
  const isEnabled = options.enabled ?? true;

  // Timer refs
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resetIdleTimerRef = useRef<(() => void) | null>(null);

  // Warning dialog state
  const [showWarning, setShowWarning] = useState(false);
  const [secondsBeforeLogout, setSecondsBeforeLogout] = useState(
    Math.ceil(warningShowBefore / 1000)
  );

  const user = useSelector((state: AppState) => state.userReducer);

  const getRefreshRequestBody = useCallback(() => {
    const storedRefreshToken = readStoredAuthTokens().refreshToken || user?.refreshToken;
    return buildRefreshRequestBody(storedRefreshToken);
  }, [user?.refreshToken]);

  // 🔧 Sadece token kimliği için ref — dependency loop önleme
  const tokenRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  // 🔧 Callback'leri ref'te tut — effect dependency'sinden çıkar (loop önleme)
  const warningShowBeforeRef = useRef(warningShowBefore);
  const idleTimeoutRef = useRef(idleTimeout);
  const refreshIntervalMsRef = useRef(refreshInterval);
  useEffect(() => { warningShowBeforeRef.current = warningShowBefore; }, [warningShowBefore]);
  useEffect(() => { idleTimeoutRef.current = idleTimeout; }, [idleTimeout]);
  useEffect(() => { refreshIntervalMsRef.current = refreshInterval; }, [refreshInterval]);

  // Backend'e logout bildirimi
  const notifyBackendLogout = useCallback(async () => {
    try {
      await apiFetch('/Auth/logout', {
        method: 'POST',
        ignoreCustomHeaders: false,
        headers: { 'Content-Type': 'application/json' },
        suppressErrorLog: true,
      } as any).catch(() => { });
    } catch { /* sessizce geç */ }
  }, []);

  // *** ÇIKIŞ ***
  const logout = useCallback(() => {
    setShowWarning(false);
    sessionStorage.setItem(LOGOUT_INTENT_KEY, "idle_timeout");
    notifyBackendLogout();

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMEOUT_KEY);
    localStorage.removeItem("persist:root");
    sessionStorage.removeItem("reduxState");
    localStorage.removeItem("fas_token");
    localStorage.removeItem("fas_refreshToken");
    localStorage.removeItem("fas_denetlenenId");
    localStorage.removeItem("fas_yil");
    localStorage.removeItem("fas_blacklisted_tokens");
    sessionStorage.removeItem("fas_debug_no_login_redirect");
    clearClientAuthStorage();

    dispatch(resetToNull(""));

    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    router.replace("/");
  }, [dispatch, router, notifyBackendLogout]);

  // 🔧 logout'u ref'te tut — effect dependency'sinden çıkar
  const logoutRef = useRef(logout);
  useEffect(() => { logoutRef.current = logout; }, [logout]);

  // Token yenileme
  const refreshToken = useCallback(async () => {
    try {
      const response = await apiFetch(`/Auth/refresh`, {
        method: "POST",
        headers: { accept: "application/json", "Content-Type": "application/json" },
        body: getRefreshRequestBody(),
        suppressErrorLog: true,
      } as any);

      if (!response.ok) {
        console.warn(`❌[AutoLogout] Token yenileme başarısız! HTTP ${response.status} `);
        return;
      }

      const data = await response.json();
      const nextToken = data.token || data.Token;
      const nextRefreshToken = data.refreshToken || data.RefreshToken;
      if (!nextToken) {
        console.warn("❌ [AutoLogout] Yenilenen token alınamadı");
        return;
      }

      dispatch(setToken(nextToken));
      if (nextRefreshToken) dispatch(setRefreshToken(nextRefreshToken));
      persistAuthSessionTokens(nextToken, nextRefreshToken || readStoredAuthTokens().refreshToken);
    } catch (err) {
      console.error("❌ [AutoLogout] Token refresh exception:", err);
      // Network hatası — logout yapma, sonraki denemeyi bekle
    }
  }, [dispatch, getRefreshRequestBody]);

  // 🔧 refreshToken'ı ref'te tut — effect dependency'sinden çıkar
  const refreshTokenRef = useRef(refreshToken);
  useEffect(() => { refreshTokenRef.current = refreshToken; }, [refreshToken]);

  // ✅ Keep session
  const keepSession = useCallback(async () => {
    // console.log("🔄 Oturum devam ettiriliyor...");
    setShowWarning(false);
    setSecondsBeforeLogout(Math.ceil(warningShowBeforeRef.current / 1000));

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    try {
      const response = await apiFetch(`/Auth/refresh`, {
        method: "POST",
        headers: { accept: "application/json", "Content-Type": "application/json" },
        body: getRefreshRequestBody(),
      });
      if (response.ok) {
        const data = await response.json();
        const nextToken = data.token || data.Token;
        const nextRefreshToken = data.refreshToken || data.RefreshToken;
        if (nextToken) dispatch(setToken(nextToken));
        if (nextRefreshToken) dispatch(setRefreshToken(nextRefreshToken));
        persistAuthSessionTokens(nextToken, nextRefreshToken || readStoredAuthTokens().refreshToken);
        // console.log("✅ Oturum başarıyla devam ettirildi");
      }
    } catch (err) {
      console.warn("⚠️ Oturum devam ettirme hatası:", err);
    }

    if (resetIdleTimerRef.current) resetIdleTimerRef.current();
  }, [dispatch, getRefreshRequestBody]);

  // =============================================
  // ANA KURULUM: Kullanıcı giriş/çıkış durumuna göre
  // =============================================
  const isLoggedIn = !!user?.token;
  const shouldRunAutoLogout = isEnabled && isLoggedIn;

  useEffect(() => {
    if (!shouldRunAutoLogout) {
      setShowWarning(false);
      setSecondsBeforeLogout(Math.ceil(warningShowBeforeRef.current / 1000));

      if (resetIdleTimerRef.current) {
        const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll"];
        events.forEach((event) => window.removeEventListener(event, resetIdleTimerRef.current!));
      }

      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

      if (isInitializedRef.current) {
        isInitializedRef.current = false;
        tokenRef.current = null;
      }

      return;
    }

    if (isInitializedRef.current) {
      // Zaten kuruluysa baştan kurma (token yenilenmiş olsa bile)
      return;
    }

    // console.log("✨ [AutoLogout] Kullanıcı girişi algılandı, timer'lar kuruluyor...");
    isInitializedRef.current = true;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

      setShowWarning(false);
      setSecondsBeforeLogout(Math.ceil(warningShowBeforeRef.current / 1000));

      localStorage.setItem(TIMEOUT_KEY, (Date.now() + idleTimeoutRef.current).toString());

      const warningTriggerTime = idleTimeoutRef.current - warningShowBeforeRef.current;

      if (warningTriggerTime > 0) {
        warningTimerRef.current = setTimeout(() => {
          setShowWarning(true);

          const countdownStart = Date.now();
          countdownTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - countdownStart;
            const remaining = Math.max(0, warningShowBeforeRef.current - elapsed);
            const remainingSeconds = Math.ceil(remaining / 1000);
            setSecondsBeforeLogout(Math.max(0, remainingSeconds));

            if (remaining <= 0) {
              clearInterval(countdownTimerRef.current!);
              logoutRef.current();
            }
          }, 100);
        }, warningTriggerTime);
      }

      // Yedek logout timer
      idleTimerRef.current = setTimeout(() => {
        logoutRef.current();
      }, idleTimeoutRef.current);
    };

    resetIdleTimerRef.current = resetIdleTimer;

    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetIdleTimer));
    resetIdleTimer();

    // Token yenileme zamanlayıcısı
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    // console.log(`⏱️[AutoLogout] Token refresh: ${refreshIntervalMsRef.current / 1000} s`);

    const initialRefreshTimer = setTimeout(() => {
      // console.log("🔄 [AutoLogout] İlk otomatik token yenileme...");
      refreshTokenRef.current();
    }, 10000);

    refreshTimerRef.current = setInterval(() => {
      // console.log(`🔄[AutoLogout] Periyodik token yenileme(${new Date().toLocaleTimeString('tr-TR')})`);
      refreshTokenRef.current();
    }, refreshIntervalMsRef.current);

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetIdleTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      clearTimeout(initialRefreshTimer);
    };
  }, [shouldRunAutoLogout]); // 🔧 FIX: Sadece geçerli oturum başladığında timer'ları kur

  // Popup açıkken event listener'ları durdur
  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll"];
    if (!shouldRunAutoLogout || !resetIdleTimerRef.current) {
      return;
    }

    if (showWarning && resetIdleTimerRef.current) {
      // console.log("🔴 [AutoLogout] Popup açıldı, timer durduruldu");
      events.forEach((event) => window.removeEventListener(event, resetIdleTimerRef.current!));
    } else if (!showWarning && resetIdleTimerRef.current) {
      // console.log("🟢 [AutoLogout] Popup kapandı, timer devam ediyor");
      events.forEach((event) => window.addEventListener(event, resetIdleTimerRef.current!));
    }
  }, [shouldRunAutoLogout, showWarning]);

  return {
    showWarning,
    secondsBeforeLogout,
    onKeepSession: keepSession,
    onLogout: logout,
  };
}
