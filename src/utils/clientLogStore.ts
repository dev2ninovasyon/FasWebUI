export type ClientLogLevel = "error" | "warn" | "info" | "debug";

export type ClientLogSource =
  | "ui"
  | "api"
  | "window"
  | "network"
  | "system";

export interface ClientLogEntry {
  id: string;
  timestamp: string;
  level: ClientLogLevel;
  source: ClientLogSource;
  message: string;
  route?: string;
  requestPath?: string;
  statusCode?: number;
  detail?: string;
}

const STORAGE_KEY = "fas_client_logs_v1";
const MAX_LOG_COUNT = 1000;

let initialized = false;
let logs: ClientLogEntry[] = [];
const listeners = new Set<() => void>();

const safeStringify = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "bigint") return value.toString();

  if (value instanceof Error) {
    return JSON.stringify(
      {
        name: value.name,
        message: value.message,
        stack: value.stack,
      },
      null,
      2
    );
  }

  const seen = new WeakSet();
  const serialized = JSON.stringify(
    value,
    (_key, val) => {
      if (typeof val === "bigint") return val.toString();
      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) return "[Circular]";
        seen.add(val);
      }
      if (val instanceof Error) {
        return {
          name: val.name,
          message: val.message,
          stack: val.stack,
        };
      }
      return val;
    },
    2
  );

  return serialized ?? String(value);
};

const tryParseStoredLogs = (raw: string | null): ClientLogEntry[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item?.message === "string");
  } catch {
    return [];
  }
};

const persistLogs = () => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // Storage failures should not break application flow.
  }
};

const ensureInitialized = () => {
  if (initialized) return;
  initialized = true;

  if (typeof window === "undefined") return;
  logs = tryParseStoredLogs(window.sessionStorage.getItem(STORAGE_KEY));
};

const emit = () => {
  listeners.forEach((listener) => listener());
};

export const addClientLog = (
  entry: Omit<ClientLogEntry, "id" | "timestamp" | "detail"> & {
    detail?: unknown;
  }
) => {
  ensureInitialized();

  const logEntry: ClientLogEntry = {
    ...entry,
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    timestamp: new Date().toISOString(),
    detail: entry.detail === undefined ? undefined : safeStringify(entry.detail),
  };

  logs = [logEntry, ...logs].slice(0, MAX_LOG_COUNT);
  persistLogs();
  emit();
};

export const getClientLogs = (): ClientLogEntry[] => {
  ensureInitialized();
  return [...logs];
};

export const clearClientLogs = () => {
  ensureInitialized();
  logs = [];
  persistLogs();
  emit();
};

export const subscribeClientLogs = (listener: () => void) => {
  ensureInitialized();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
