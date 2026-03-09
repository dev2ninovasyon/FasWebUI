/**
 * @file sessionConfig.ts
 * @description Oturum yönetimi ile ilgili kurumsal süre sınırları ve sabitler.
 */

// İşlemsizlik (Inactivity) süresi - 30 Dakika
export const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

// Toplam Oturum Uyarısı süresi - 45 Dakika
export const TOTAL_SESSION_WARNING = 45 * 60 * 1000;

// Uyarı Popup'ının ekranda kalma süresi - 2 Dakika
export const WARNING_DURATION = 2 * 60 * 1000;

// Sekmeler arası iletişim kanalı adı
export const SESSION_BROADCAST_CHANNEL = "fas_session_channel";

// Yerel depolama anahtarları
export const LAST_ACTIVITY_KEY = "fas_last_activity";
export const SESSION_START_KEY = "fas_session_start";
export const LOGOUT_REASON_KEY = "fas_logout_reason";

// Logout Nedenleri
export enum LogoutReason {
    INACTIVITY = "inactivity",
    TIMEOUT = "timeout",
    MANUAL = "manual",
    SERVER_EXPIRED = "server_expired",
}

// Mesaj Tipleri
export type SessionMessage =
    | { type: "ACTIVITY"; timestamp: number }
    | { type: "LOGOUT"; reason: LogoutReason }
    | { type: "SESSION_EXTENDED"; timestamp: number };
