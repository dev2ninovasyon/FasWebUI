'use client';

/**
 * useBildirimConnection Hook
 * Manages SignalR real-time notifications with automatic polling fallback
 * 
 * Benefits of Hook Pattern:
 * - Proper cleanup with useEffect return
 * - No module-level mutable state
 * - Component-scoped state management
 * - Multiple independent connections possible
 * - Memory leak prevention through ref cleanup
 */

import { useEffect, useRef, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import SecureTokenManager from '@/utils/SecureTokenManager';
import {
  BildirimEvent,
  BildirimCallback,
  BildirimConnectionState,
  BildirimConnectionConfig,
} from '@/api/BaglantiBilgileri/BaglantiBilgileri.types';
import { getBildirimler } from '@/api/BaglantiBilgileri/BaglantiBilgileri';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://betaapi.fasmart.app/api';
const POLLING_INTERVAL = 5000; // 5 seconds

/**
 * Get base API URL for SignalR hub
 */
const getHubUrl = (): string => {
  const baseUrl = API_URL.replace(/\/api$/, '').replace(/\/$/, '');
  return `${baseUrl}/bildirim-hub`;
};

/**
 * useBildirimConnection Hook - Main Implementation
 * @param config Connection configuration
 * @returns Connection state and control methods
 */
export function useBildirimConnection(config: BildirimConnectionConfig) {
  const { denetciId, autoConnect = true, pollingInterval = POLLING_INTERVAL } = config;

  // Connection ref (doesn't trigger re-render)
  const hubConnectionRef = useRef<HubConnection | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<BildirimCallback | null>(null);
  const lastNotificationTimeRef = useRef<Date>(new Date());

  // State for UI
  const [status, setStatus] = useState<'disconnected' | 'connected' | 'reconnecting'>('disconnected');
  const [bildirimState, setBildirimState] = useState<BildirimConnectionState>({
    status: 'disconnected',
    isPollingActive: false,
    listenerRegistered: false,
    hasCallback: false,
    signalRConnected: false,
    error: null,
  });

  /**
   * Start polling as fallback when SignalR is unavailable
   */
  const startPolling = (callback: BildirimCallback) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    console.log('📡 Polling modu başlatıldı (her 5 saniyede kontrol)');
    lastNotificationTimeRef.current = new Date();

    const checkNotifications = async () => {
      try {
        const bildirimler = await getBildirimler(denetciId);

        if (bildirimler && Array.isArray(bildirimler)) {
          console.log(`📊 API'den ${bildirimler.length} bildirim alındı`);

          for (const bildirim of bildirimler) {
            const bildirimTarihi = new Date(bildirim.tarih || new Date());

            if (bildirimTarihi > lastNotificationTimeRef.current && !bildirim.okundumu) {
              console.log('✅ YENİ BİLDİRİM - Callback çağrılıyor:', bildirim.konu);
              callback(bildirim);
              lastNotificationTimeRef.current = new Date();
            }
          }
        }
      } catch (error) {
        console.error('❌ Polling hatası:', error);
      }
    };

    // Check immediately, then at intervals
    checkNotifications();
    pollingIntervalRef.current = setInterval(checkNotifications, pollingInterval);

    setBildirimState(prev => ({
      ...prev,
      isPollingActive: true,
    }));
  };

  /**
   * Stop polling
   */
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('📡 Polling modu durduruldu');

      setBildirimState(prev => ({
        ...prev,
        isPollingActive: false,
      }));
    }
  };

  /**
   * Start SignalR connection
   */
  const startConnection = async () => {
    // Already connected?
    if (hubConnectionRef.current?.state === HubConnectionState.Connected) {
      console.log('SignalR zaten bağlı, tekrar bağlanmıyor');
      return;
    }

    try {
      setStatus('reconnecting');

      const token = SecureTokenManager.getAccessToken() || '';
      const reconnectStrategy =
        process.env.NODE_ENV === 'development' ? [0, 5000, 10000] : [0, 2000, 5000, 10000, 30000];

      hubConnectionRef.current = new HubConnectionBuilder()
        .withUrl(getHubUrl(), {
          accessTokenFactory: () => SecureTokenManager.getAccessToken() || '',
        })
        .withAutomaticReconnect(reconnectStrategy)
        .configureLogging(
          process.env.NODE_ENV === 'development' ? LogLevel.Warning : LogLevel.Information
        )
        .build();

      // Register callback BEFORE starting connection
      if (callbackRef.current) {
        hubConnectionRef.current.on('YeniBildirim', callbackRef.current);
        console.log('✅ YeniBildirim listener kaydediliyor');
      }

      // Connection event handlers
      hubConnectionRef.current.onreconnecting(() => {
        console.warn('⚠️ SignalR yeniden bağlanmaya çalışıyor...');
        setStatus('reconnecting');
      });

      hubConnectionRef.current.onreconnected(() => {
        console.log('✅ SignalR yeniden bağlandı');
        setStatus('connected');
      });

      hubConnectionRef.current.onclose(async () => {
        console.warn('❌ SignalR bağlantısı kapandı');
        hubConnectionRef.current = null;
        setStatus('disconnected');

        // Fallback to polling
        if (callbackRef.current) {
          startPolling(callbackRef.current);
        }
      });

      console.log('🔌 SignalR bağlantısı kuruluyor...');
      await hubConnectionRef.current.start();

      console.log('✅ SignalR bağlantısı başarılı! Grup katılımı yapılıyor...');
      await hubConnectionRef.current.invoke('JoinDenetciGroup', denetciId);

      console.log('✅ SignalR bağlantısı başarılı ve gruba katılım yapıldı!');

      setStatus('connected');
      stopPolling(); // Stop polling if SignalR is active

      setBildirimState(prev => ({
        ...prev,
        status: 'connected',
        signalRConnected: true,
      }));
    } catch (error) {
      console.error('❌ SignalR bağlantı hatası:', error);
      setStatus('disconnected');

      // Cleanup connection
      try {
        if (hubConnectionRef.current) {
          await hubConnectionRef.current.stop().catch(() => {});
        }
      } catch (stopError) {
        console.error('Bağlantı durdurma hatası:', stopError);
      }
      hubConnectionRef.current = null;

      // Fallback to polling
      if (callbackRef.current) {
        console.warn('⚠️ SignalR başarısız, polling fallback\'ine geçiliyor...');
        startPolling(callbackRef.current);
      }

      setBildirimState(prev => ({
        ...prev,
        status: 'disconnected',
        signalRConnected: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  };

  /**
   * Stop SignalR connection
   */
  const stopConnection = async () => {
    stopPolling();

    if (hubConnectionRef.current) {
      try {
        await hubConnectionRef.current.stop();
        console.log('SignalR bağlantısı kesildi');
      } catch (error) {
        console.error('SignalR kapatma hatası:', error);
      }
      hubConnectionRef.current = null;
    }

    setStatus('disconnected');
    setBildirimState(prev => ({
      ...prev,
      status: 'disconnected',
      signalRConnected: false,
      listenerRegistered: false,
    }));
  };

  /**
   * Register notification callback
   */
  const registerCallback = (callback: BildirimCallback, _denetciId?: number) => {
    callbackRef.current = callback;

    // If SignalR is connected, register immediately
    if (hubConnectionRef.current?.state === HubConnectionState.Connected) {
      hubConnectionRef.current.off('YeniBildirim');
      hubConnectionRef.current.on('YeniBildirim', callback);
      console.log('✅ YeniBildirim listener aktif');
    } else {
      console.warn('⚠️ SignalR henüz bağlı değil');
    }

    setBildirimState(prev => ({
      ...prev,
      hasCallback: true,
      listenerRegistered: hubConnectionRef.current?.state === HubConnectionState.Connected,
    }));
  };

  /**
   * Test SignalR connection
   */
  const testConnection = async (): Promise<boolean> => {
    try {
      const baseUrl = API_URL.replace(/\/api$/, '').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });
      console.log('✅ Backend erişilebilir:', response.status);
      return response !== null;
    } catch (error) {
      console.error('Test hatası:', error);
      return false;
    }
  };

  /**
   * Main useEffect - Setup and Cleanup
   */
  useEffect(() => {
    if (autoConnect) {
      startConnection();
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop().catch(() => {});
      }
    };
  }, [denetciId, autoConnect]); // Re-run if denetciId changes

  return {
    status,
    bildirimState,
    startConnection,
    stopConnection,
    registerCallback,
    testConnection,
  };
}

/**
 * Simplified hook if you don't need advanced control
 * @param denetciId Denetçi ID
 * @param callback Notification callback function
 */
export function useSimpleBildirim(denetciId: number, callback: BildirimCallback) {
  const { status, registerCallback } = useBildirimConnection({
    denetciId,
    autoConnect: true,
  });

  useEffect(() => {
    registerCallback(callback, denetciId);
  }, [callback, denetciId, registerCallback]);

  return status;
}
