'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from '@microsoft/signalr';
import SecureTokenManager from '@/utils/SecureTokenManager';
import { url as apiBaseUrl } from '@/api/apiConfig';
import {
  BildirimCallback,
  BildirimConnectionConfig,
  BildirimConnectionState,
} from '@/api/BaglantiBilgileri/BaglantiBilgileri.types';
import { getBildirimler } from '@/api/BaglantiBilgileri/BaglantiBilgileri';

const getApiBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  apiBaseUrl ||
  'https://betaapi.fasmart.app/api';

const getHubUrl = (): string => {
  const baseUrl = getApiBaseUrl().replace(/\/api$/, '').replace(/\/$/, '');
  return `${baseUrl}/bildirim-hub`;
};

const POLLING_INTERVAL = 60000;
const SIGNALR_RETRY_COOLDOWN_MS = 2 * 60 * 1000;
const MAX_CONNECTION_RETRIES = 2;

const isCancelledConnectionError = (message: string) =>
  message.includes('before stop() was called') ||
  message.includes('stopped during negotiation');

export function useBildirimConnection(config: BildirimConnectionConfig) {
  const { denetciId, autoConnect = true, pollingInterval = POLLING_INTERVAL } = config;

  const hubConnectionRef = useRef<HubConnection | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<BildirimCallback | null>(null);
  const lastNotificationTimeRef = useRef<Date>(new Date());
  const connectionRetryRef = useRef<number>(0);
  const lastSignalRFailureAtRef = useRef<number>(0);
  const startAttemptRef = useRef<number>(0);

  const [status, setStatus] = useState<'disconnected' | 'connected' | 'reconnecting'>('disconnected');
  const [bildirimState, setBildirimState] = useState<BildirimConnectionState>({
    status: 'disconnected',
    isPollingActive: false,
    listenerRegistered: false,
    hasCallback: false,
    signalRConnected: false,
    error: null,
  });

  const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;

      setBildirimState((prev) => ({
        ...prev,
        isPollingActive: false,
      }));
    }
  }, []);

  const startPolling = useCallback(
    (callback: BildirimCallback) => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      lastNotificationTimeRef.current = new Date();

      const checkNotifications = async () => {
        try {
          const bildirimler = await getBildirimler(denetciId);

          if (!bildirimler || !Array.isArray(bildirimler)) {
            return;
          }

          let latestTime = lastNotificationTimeRef.current;
          
          for (const bildirim of bildirimler) {
            const bildirimTarihi = new Date(bildirim.tarih || new Date());

            if (bildirimTarihi > lastNotificationTimeRef.current && !bildirim.okundumu) {
              callback(bildirim);
              if (bildirimTarihi > latestTime) {
                latestTime = bildirimTarihi;
              }
            }
          }
          lastNotificationTimeRef.current = latestTime;
        } catch (error) {
          console.error('Polling hatasi:', error);
        }
      };

      void checkNotifications();
      pollingIntervalRef.current = setInterval(checkNotifications, pollingInterval);

      setBildirimState((prev) => ({
        ...prev,
        isPollingActive: true,
      }));
    },
    [denetciId, pollingInterval]
  );

  const stopConnection = useCallback(async () => {
    startAttemptRef.current += 1;
    stopPolling();

    const connection = hubConnectionRef.current;
    hubConnectionRef.current = null;

    if (connection) {
      try {
        await connection.stop();
      } catch {
        // no-op
      }
    }

    setStatus('disconnected');
    setBildirimState((prev) => ({
      ...prev,
      status: 'disconnected',
      signalRConnected: false,
      listenerRegistered: false,
    }));
  }, [stopPolling]);

  const startConnection = async (forceSkipNegotiation = false) => {
    const startAttemptId = ++startAttemptRef.current;

    if (
      lastSignalRFailureAtRef.current &&
      Date.now() - lastSignalRFailureAtRef.current < SIGNALR_RETRY_COOLDOWN_MS
    ) {
      if (callbackRef.current) {
        startPolling(callbackRef.current);
      }
      return;
    }

    if (hubConnectionRef.current?.state === HubConnectionState.Connected) {
      return;
    }

    if (hubConnectionRef.current?.state === HubConnectionState.Connecting) {
      return;
    }

    if (connectionRetryRef.current >= MAX_CONNECTION_RETRIES) {
      if (callbackRef.current) {
        startPolling(callbackRef.current);
      }
      return;
    }

    try {
      setStatus('reconnecting');

      const reconnectStrategy =
        process.env.NODE_ENV === 'development' ? [0, 5000, 10000] : [0, 2000, 5000, 10000, 30000];
      const hubUrl = getHubUrl();
      const baseUrl = getApiBaseUrl().replace(/\/api$/, '').replace(/\/$/, '');

      try {
        await fetch(`${baseUrl}/api/health`, {
          signal: AbortSignal.timeout(4000),
        });
      } catch (healthError) {
        lastSignalRFailureAtRef.current = Date.now();
        if (callbackRef.current) {
          startPolling(callbackRef.current);
        }
        setBildirimState((prev) => ({
          ...prev,
          status: 'disconnected',
          signalRConnected: false,
          error: healthError instanceof Error ? healthError : new Error(String(healthError)),
        }));
        return;
      }

      const hubOptions: {
        accessTokenFactory: () => string;
        skipNegotiation?: boolean;
        transport?: HttpTransportType;
      } = {
        accessTokenFactory: () => SecureTokenManager.getAccessToken() || '',
      };

      if (forceSkipNegotiation) {
        hubOptions.skipNegotiation = true;
        hubOptions.transport = HttpTransportType.WebSockets;
      }

      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl, hubOptions)
        .withAutomaticReconnect(reconnectStrategy)
        .configureLogging(LogLevel.None)
        .build();

      hubConnectionRef.current = connection;

      if (callbackRef.current) {
        connection.on('YeniBildirim', callbackRef.current);
      }

      connection.onreconnecting(() => {
        setStatus('reconnecting');
      });

      connection.onreconnected(() => {
        setStatus('connected');
      });

      connection.onclose(() => {
        if (hubConnectionRef.current === connection) {
          hubConnectionRef.current = null;
        }
        setStatus('disconnected');
        if (callbackRef.current) {
          startPolling(callbackRef.current);
        }
      });

      await connection.start();

      if (startAttemptRef.current !== startAttemptId) {
        await connection.stop().catch(() => {});
        return;
      }

      if (hubConnectionRef.current !== connection || connection.state !== HubConnectionState.Connected) {
        lastSignalRFailureAtRef.current = Date.now();
        if (callbackRef.current) {
          startPolling(callbackRef.current);
        }
        return;
      }

      await connection.invoke('JoinDenetciGroup', denetciId);

      connectionRetryRef.current = 0;
      setStatus('connected');
      stopPolling();

      setBildirimState((prev) => ({
        ...prev,
        status: 'connected',
        signalRConnected: true,
      }));
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      const wasCancelled =
        startAttemptRef.current !== startAttemptId || isCancelledConnectionError(errMessage);

      if (wasCancelled) {
        return;
      }

      setStatus('disconnected');
      lastSignalRFailureAtRef.current = Date.now();

      try {
        await hubConnectionRef.current?.stop().catch(() => {});
      } catch {
        // no-op
      }
      hubConnectionRef.current = null;

      if (!forceSkipNegotiation && errMessage.includes('negotiation')) {
        connectionRetryRef.current += 1;
        await delay(1200);
        await startConnection(true);
        return;
      }

      connectionRetryRef.current += 1;
      if (connectionRetryRef.current < MAX_CONNECTION_RETRIES) {
        await delay(1000);
        await startConnection(forceSkipNegotiation);
        return;
      }

      if (callbackRef.current) {
        startPolling(callbackRef.current);
      }

      setBildirimState((prev) => ({
        ...prev,
        status: 'disconnected',
        signalRConnected: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  };

  const registerCallback = useCallback((callback: BildirimCallback, _denetciId?: number) => {
    callbackRef.current = callback;

    if (hubConnectionRef.current?.state === HubConnectionState.Connected) {
      hubConnectionRef.current.off('YeniBildirim');
      hubConnectionRef.current.on('YeniBildirim', callback);
    }

    setBildirimState((prev) => ({
      ...prev,
      hasCallback: true,
      listenerRegistered: hubConnectionRef.current?.state === HubConnectionState.Connected,
    }));
  }, []);

  const testConnection = async (): Promise<boolean> => {
    try {
      const baseUrl = getApiBaseUrl().replace(/\/api$/, '').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });
      return response !== null;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (autoConnect) {
      void startConnection();
    }

    return () => {
      void stopConnection();
    };
  }, [denetciId, autoConnect, stopConnection]);

  return {
    status,
    bildirimState,
    startConnection,
    stopConnection,
    registerCallback,
    testConnection,
  };
}

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
