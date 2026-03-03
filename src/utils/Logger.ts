import { url } from "@/api/apiBase";

/**
 * Development-focused frontend logger.
 * Sends logs to backend without reading auth tokens from localStorage.
 */
class Logger {
  private static isDev = process.env.NODE_ENV === "development";

  static async error(message: string, error?: any) {
    console.error(`[Frontend Error]: ${message}`, error);
    await this.sendToBackend("error", message, error);
  }

  static async warn(message: string, context?: any) {
    console.warn(`[Frontend Warn]: ${message}`, context);
    if (this.isDev) {
      await this.sendToBackend("warn", message, context);
    }
  }

  static async info(message: string, context?: any) {
    console.log(`[Frontend Info]: ${message}`, context);
    if (this.isDev) {
      await this.sendToBackend("info", message, context);
    }
  }

  private static async sendToBackend(level: string, message: string, detail?: any) {
    try {
      const logData = {
        level,
        message,
        url: typeof window !== "undefined" ? window.location.href : "SSR",
        stack: detail instanceof Error ? detail.stack : JSON.stringify(detail),
      };

      fetch(`${url.endsWith("/") ? url.slice(0, -1) : url}/Log/frontend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
        credentials: "include",
      }).catch(() => {
        // Logging should never break application flow.
      });
    } catch {
      // Ignore logger transport failures to avoid recursive error loops.
    }
  }
}

export default Logger;
