import {
  addClientLog,
  ClientLogLevel,
  ClientLogSource,
} from "@/utils/clientLogStore";
import axios from "axios";
import { url } from "@/api/apiConfig";

interface LoggerMeta {
  source?: ClientLogSource;
  requestPath?: string;
  statusCode?: number;
  route?: string;
}

/**
 * Frontend logger that keeps logs in browser memory/session storage
 * and also sends them to the server's file-based logging system.
 */
class Logger {
  private static async sendToServer(
    level: ClientLogLevel,
    message: string,
    route: string,
    source: string,
    detail?: any
  ) {
    try {
      // Non-blocking call to server
      axios.post(`${url}/Audit/ClientLog`, {
        level,
        message,
        route,
        source,
        detail: typeof detail === "object" ? JSON.stringify(detail, null, 2) : String(detail ?? ""),
        timestamp: new Date().toISOString(),
      }).catch(() => {
        /* Silently fail server logging to not disrupt UI */
      });
    } catch (e) {
      // Ignore
    }
  }

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

    // Also send to server
    this.sendToServer(level, message, route, source, detail);
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
