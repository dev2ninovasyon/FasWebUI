import {
  addClientLog,
  ClientLogLevel,
  ClientLogSource,
} from "@/utils/clientLogStore";

interface LoggerMeta {
  source?: ClientLogSource;
  requestPath?: string;
  statusCode?: number;
  route?: string;
}

/**
 * Frontend logger that keeps logs in browser memory/session storage.
 * No DB write is performed.
 */
class Logger {
  private static write(
    level: ClientLogLevel,
    message: string,
    detail?: any,
    meta: LoggerMeta = {}
  ) {
    const source = meta.source ?? "ui";
    const route =
      meta.route ??
      (typeof window !== "undefined" ? window.location.pathname : "SSR");

    addClientLog({
      level,
      source,
      message,
      route,
      requestPath: meta.requestPath,
      statusCode: meta.statusCode,
      detail,
    });
  }

  static async error(message: string, error?: any, meta: LoggerMeta = {}) {
    console.error(`[Frontend Error]: ${message}`, error);
    this.write("error", message, error, meta);
  }

  static async warn(message: string, context?: any, meta: LoggerMeta = {}) {
    console.warn(`[Frontend Warn]: ${message}`, context);
    this.write("warn", message, context, meta);
  }

  static async info(message: string, context?: any, meta: LoggerMeta = {}) {
    console.log(`[Frontend Info]: ${message}`, context);
    this.write("info", message, context, meta);
  }
}

export default Logger;
