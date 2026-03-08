"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthSession } from "@/contexts/AuthSessionContext";
import {
    INACTIVITY_TIMEOUT,
    TOTAL_SESSION_WARNING,
    WARNING_DURATION,
    SESSION_BROADCAST_CHANNEL,
    LAST_ACTIVITY_KEY,
    SESSION_START_KEY,
    LogoutReason,
    SessionMessage,
} from "./sessionConfig";

export default function useSessionManagement() {
    const { status, clearSession, refreshSession } = useAuthSession();
    const router = useRouter();
    const pathname = usePathname();

    // Dialog states
    const [showWarning, setShowWarning] = useState(false);
    const [warningReason, setWarningReason] = useState<LogoutReason | null>(null);
    const [secondsRemaining, setSecondsRemaining] = useState(WARNING_DURATION / 1000);

    // Refs for timers
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
    const totalSessionTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

    const isLoggedIn = status === "authenticated";

    // --- Merkezi Logout Fonksiyonu ---
    const handleLogout = useCallback((reason: LogoutReason, broadcast = true) => {
        if (broadcast && broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({ type: "LOGOUT", reason });
        }
        setShowWarning(false);
        clearSession(reason);
        router.replace("/");
    }, [clearSession, router]);

    // --- Session Uzatma ---
    const handleKeepSession = useCallback(async (broadcast = true) => {
        const success = await refreshSession({ forceRefresh: true });
        if (success) {
            setShowWarning(false);
            // Session start zamanını güncelle (45 dk başa sarar)
            localStorage.setItem(SESSION_START_KEY, Date.now().toString());

            if (broadcast && broadcastChannelRef.current) {
                broadcastChannelRef.current.postMessage({ type: "SESSION_EXTENDED", timestamp: Date.now() });
            }
            resetTimers();
        } else {
            handleLogout(LogoutReason.SERVER_EXPIRED);
        }
    }, [refreshSession, handleLogout]);

    // --- Zamanlayıcıları Başlat/Sıfırla ---
    const resetTimers = useCallback(() => {
        if (!isLoggedIn || pathname === "/maintenance") return;

        // 1. Önceki tüm timer'ları temizle
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        if (totalSessionTimerRef.current) clearTimeout(totalSessionTimerRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

        // 2. Inactivity Timer (30 dk)
        // lastActivity'i localStorage'dan al (diğer sekmelerle senkronize)
        const lastActivity = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now().toString());
        const inactivityRemaining = Math.max(0, INACTIVITY_TIMEOUT - (Date.now() - lastActivity));

        inactivityTimerRef.current = setTimeout(() => {
            handleLogout(LogoutReason.INACTIVITY);
        }, inactivityRemaining);

        // 3. Total Session Timer (45 dk uyarısı)
        const sessionStart = parseInt(localStorage.getItem(SESSION_START_KEY) || Date.now().toString());
        const timeSinceStart = Date.now() - sessionStart;
        const warningTriggerTime = TOTAL_SESSION_WARNING - timeSinceStart;

        if (warningTriggerTime <= 0) {
            // Süre zaten dolmuş veya çok yakın, uyarını göster
            startWarningCountdown(LogoutReason.TIMEOUT);
        } else {
            totalSessionTimerRef.current = setTimeout(() => {
                startWarningCountdown(LogoutReason.TIMEOUT);
            }, warningTriggerTime);
        }
    }, [isLoggedIn, handleLogout]);

    // --- Geri Sayım Başlat ---
    const startWarningCountdown = (reason: LogoutReason) => {
        setWarningReason(reason);
        setShowWarning(true);
        setSecondsRemaining(WARNING_DURATION / 1000);

        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

        const startTime = Date.now();
        countdownTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, WARNING_DURATION - elapsed);
            const remainingSec = Math.max(0, Math.ceil(remaining / 1000));

            setSecondsRemaining(remainingSec);

            if (remaining <= 0) {
                clearInterval(countdownTimerRef.current!);
                handleLogout(reason);
            }
        }, 1000);
    };

    // --- Aktivite Kaydı ---
    const trackActivity = useCallback(() => {
        if (!isLoggedIn || showWarning || pathname === "/maintenance") return;

        const now = Date.now();
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());

        if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({ type: "ACTIVITY", timestamp: now });
        }

        resetTimers();
    }, [isLoggedIn, showWarning, pathname, resetTimers]);

    // --- BroadcastChannel Kurulumu ---
    useEffect(() => {
        if (typeof window === "undefined") return;

        const channel = new BroadcastChannel(SESSION_BROADCAST_CHANNEL);
        broadcastChannelRef.current = channel;

        channel.onmessage = (event: MessageEvent<SessionMessage>) => {
            const msg = event.data;
            switch (msg.type) {
                case "ACTIVITY":
                    // Başka tabda aktivite oldu, timer'ları sıfırla
                    resetTimers();
                    break;
                case "LOGOUT":
                    // Başka tab logout oldu, biz de olalım
                    handleLogout(msg.reason, false);
                    break;
                case "SESSION_EXTENDED":
                    // Başka tab session uzattı
                    setShowWarning(false);
                    resetTimers();
                    break;
            }
        };

        // Storage event fallback (Aynı domain sekmeleri arası senkronizasyon için)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === LAST_ACTIVITY_KEY || e.key === SESSION_START_KEY) {
                resetTimers();
            }
        };
        window.addEventListener("storage", handleStorageChange);

        return () => {
            channel.close();
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [handleLogout, resetTimers]);

    // --- Global Event Listeners ---
    useEffect(() => {
        if (!isLoggedIn || pathname === "/maintenance") return;

        const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
        const handler = () => trackActivity();

        events.forEach((e) => window.addEventListener(e, handler, { passive: true }));

        // Uygulama ilk açıldığında veya tab geri gelince timerları kur
        resetTimers();

        return () => {
            events.forEach((e) => window.removeEventListener(e, handler));
        };
    }, [isLoggedIn, trackActivity, resetTimers, pathname]);

    // Sayfa ilk yüklendiğinde session_start yoksa oluştur (yenileme veya yeni sekme)
    useEffect(() => {
        if (isLoggedIn && !localStorage.getItem(SESSION_START_KEY)) {
            localStorage.setItem(SESSION_START_KEY, Date.now().toString());
        }
    }, [isLoggedIn]);

    // --- Login/Logout Durumunda Reset ---
    useEffect(() => {
        if (!isLoggedIn) {
            setShowWarning(false);
            setWarningReason(null);

            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            if (totalSessionTimerRef.current) clearTimeout(totalSessionTimerRef.current);
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

            // Eski activity izlerini temizle
            if (typeof window !== "undefined") {
                localStorage.removeItem(LAST_ACTIVITY_KEY);
                localStorage.removeItem(SESSION_START_KEY);
            }
        }
    }, [isLoggedIn]);

    return {
        showWarning,
        warningReason,
        secondsRemaining,
        maxSeconds: WARNING_DURATION / 1000,
        onKeepSession: handleKeepSession,
        onLogout: () => handleLogout(LogoutReason.MANUAL),
    };
}
