import { useDispatch, useSelector } from "@/store/hooks";
import { resetToNull, setToken, setRefreshToken } from "@/store/user/UserSlice";  // ✅ setRefreshToken import
import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback, useState } from "react";
import { AppState } from "@/store/store";
import { apiFetch } from "@/api/apiBase";
import SecureTokenManager from "@/utils/SecureTokenManager";

const STORAGE_KEY = "user";
const TIMEOUT_KEY = "user_expiry";

interface UseAutoLogoutReturn {
  showWarning: boolean;
  secondsBeforeLogout: number;
  onKeepSession: () => void;
  onLogout: () => void;
}

export default function useAutoLogout(
  idleTimeout: number,     // kullanıcı inaktifse logout süresi (ms)
  refreshInterval: number, // token yenileme süresi (ms)
  warningShowBefore: number = 60 * 1000 // Logout'tan kaç ms önce uyarı göster (varsayılan 60 saniye)
): UseAutoLogoutReturn {
  const dispatch = useDispatch();
  const router = useRouter();
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshCountdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resetIdleTimerRef = useRef<(() => void) | null>(null);

  // Warning dialog state
  const [showWarning, setShowWarning] = useState(false);
  const [secondsBeforeLogout, setSecondsBeforeLogout] = useState(60);

  const user = useSelector((state: AppState) => state.userReducer);

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
    // Warning state'i temizle
    setShowWarning(false);
    
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
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (refreshCountdownTimerRef.current) clearInterval(refreshCountdownTimerRef.current);

    router.replace("/Login");
  }, [dispatch, router, notifyBackendLogout]);

  // ✅ Keep session by refreshing token and resetting idle timer
  const keepSession = useCallback(async () => {
    console.log("🔄 Oturum devam ettiriliyor...");
    setShowWarning(false);
    setSecondsBeforeLogout(60);
    
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    
    // Refresh token
    try {
      const response = await apiFetch(`/Auth/refresh`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(setToken(data.token));
        if (data.refreshToken) {
          dispatch(setRefreshToken(data.refreshToken));
        }
        console.log("✅ Oturum başarıyla devam ettirildi");
      }
    } catch (err) {
      console.warn("⚠️ Oturum devam ettirme hatası:", err);
    }
    
    // Reset idle timer via ref
    if (resetIdleTimerRef.current) {
      resetIdleTimerRef.current();
    }
  }, [dispatch]);

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
      console.log("✅ Token başarıyla yenilendi");
    } catch (err) {
      console.log("Refresh token yenilenemedi (catch):", err);
      logout();
    }
  }, [dispatch, logout]);

  useEffect(() => {
    if (!user?.token) return;

    // Helper function to reset idle timer - called from multiple places
    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

      setShowWarning(false);
      setSecondsBeforeLogout(60);

      const expiry = Date.now() + idleTimeout;
      localStorage.setItem(TIMEOUT_KEY, expiry.toString());

      // Show warning dialog X seconds before logout (default 60 seconds before)
      const warningTriggerTime = idleTimeout - warningShowBefore;
      
      if (warningTriggerTime > 0) {
        warningTimerRef.current = setTimeout(() => {
          // Show warning and start countdown
          setShowWarning(true);
          
          // Start countdown timer for warning dialog
          const countdownStart = Date.now();
          countdownTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - countdownStart;
            const remaining = Math.max(0, warningShowBefore - elapsed);
            const remainingSeconds = Math.ceil(remaining / 1000);
            
            setSecondsBeforeLogout(Math.max(0, remainingSeconds));
            
            if (remaining <= 0) {
              clearInterval(countdownTimerRef.current!);
              // Auto logout when countdown reaches 0
              logout();
            }
          }, 100); // Update UI every 100ms for smooth countdown
        }, warningTriggerTime);
      }

      // Final logout timer (as backup)
      idleTimerRef.current = setTimeout(() => {
        logout();
      }, idleTimeout);
    };

    // Store reset function in ref so keepSession can call it
    resetIdleTimerRef.current = resetIdleTimer;

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
    ];

    events.forEach((event) => window.addEventListener(event, resetIdleTimer));
    resetIdleTimer();

    // Token yenileme zamanlayıcısı - her 30 dakikada bir token yenile
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);

    refreshTimerRef.current = setInterval(() => {
      console.log("🔄 Token otomatik olarak yenileniyor...");
      refreshToken();
    }, refreshInterval);

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (refreshCountdownTimerRef.current) clearInterval(refreshCountdownTimerRef.current);
    };
  }, [user?.token, refreshToken, refreshInterval, idleTimeout, warningShowBefore, logout]);

  return {
    showWarning,
    secondsBeforeLogout,
    onKeepSession: keepSession,
    onLogout: logout,
  };
}
