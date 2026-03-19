/**
 * BaglantiBilgileri (Connection Information) & Notifications TypeScript Types
 * Defines all types for Real-time Communication and Notification Management
 */

/**
 * Bildirim (Notification) event structure
 * Represents a single notification received from backend via SignalR or Polling
 */
export interface BildirimEvent {
  id?: number;
  konu: string; // Subject/Title
  aciklama?: string; // Description
  tarih: Date; // Timestamp
  okundumu: boolean; // Read status
  tip?: string; // Notification type
  [key: string]: any; // Extensible for future fields
}

/**
 * SignalR Connection Status
 */
export type ConnectionStatus = 'disconnected' | 'connected' | 'reconnecting';

/**
 * State object for BildirimConnection hook
 */
export interface BildirimConnectionState {
  status: ConnectionStatus;
  isPollingActive: boolean;
  listenerRegistered: boolean;
  hasCallback: boolean;
  signalRConnected: boolean;
  error?: Error | null;
}

/**
 * Connection configuration options
 */
export interface BildirimConnectionConfig {
  denetciId: number;
  autoConnect?: boolean;
  pollingInterval?: number; // milliseconds
}

/**
 * Callback function type for notification events
 */
export type BildirimCallback = (bildirim: BildirimEvent) => void;

/**
 * BaglantiBilgileri API response
 */
export interface BaglantiBilgileriData {
  denetciId: number;
  denetlenenId: number;
  kullaniciId: number;
  yil: number;
  tip?: string;
  kaynakUrl?: string;
  [key: string]: any;
}

/**
 * Multiple BaglantiBilgileri records response
 */
export type BaglantiBilgileriListResponse = BaglantiBilgileriData[];

/**
 * Bildirimler API response - array of notifications
 */
export type BildirimlerResponse = BildirimEvent[];

/**
 * SignalR Hub connection state map
 * Reference: https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.signalr.client.hubconnectionstate
 */
export const HubConnectionStateMap = {
  0: 'Disconnected',
  1: 'Connected',
  2: 'Reconnecting',
} as const;

/**
 * Hook return type for useBildirimConnection
 */
export interface UseBildirimConnectionReturn {
  status: ConnectionStatus;
  bildirimState: BildirimConnectionState;
  startConnection: (denetciId: number) => Promise<void>;
  stopConnection: () => Promise<void>;
  registerCallback: (callback: BildirimCallback, denetciId?: number) => void;
  testConnection: () => Promise<boolean>;
}
