// useAutoLogout.ts
import { useDispatch } from "@/store/hooks";
import { resetToNull } from "@/store/user/UserSlice";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "user";
const TIMEOUT_KEY = "user_expiry";

export default function useAutoLogout(timeout: number = 45 * 60 * 1000) {
  const dispatch = useDispatch();
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMEOUT_KEY);
    dispatch(resetToNull(""));
    router.push("/");
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const expiry = Date.now() + timeout;
    localStorage.setItem(TIMEOUT_KEY, expiry.toString());
    timerRef.current = setTimeout(logout, timeout);
  }, [logout, timeout]);

  useEffect(() => {
    // Uygulama açıldığında süre dolmuş mu kontrol et
    const expiry = localStorage.getItem(TIMEOUT_KEY);
    if (expiry && Date.now() > parseInt(expiry)) {
      logout();
      return;
    }

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // İlk başlatma

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [logout, resetTimer]);

  return null;
}
