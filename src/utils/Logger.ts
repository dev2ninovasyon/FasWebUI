import { url } from "@/api/apiBase";

/**
 * 📝 Geliştirme modu için Error Logger
 * Hataları hem konsola basar hem de backend'deki log dosyasına gönderir.
 */
class Logger {
    private static isDev = process.env.NODE_ENV === "development";

    static async error(message: string, error?: any) {
        console.error(`[Frontend Error]: ${message}`, error);

        // Prod modunda da error loglarını gönder
        await this.sendToBackend("error", message, error);
    }

    static async warn(message: string, context?: any) {
        console.warn(`[Frontend Warn]: ${message}`, context);

        // Prod ortamında uyarıları dosyaya yazma (gereksiz kalabalığı önler)
        if (this.isDev) {
            await this.sendToBackend("warn", message, context);
        }
    }

    static async info(message: string, context?: any) {
        console.log(`[Frontend Info]: ${message}`, context);

        // Prod ortamında bilgi mesajlarını dosyaya yazma
        if (this.isDev) {
            await this.sendToBackend("info", message, context);
        }
    }

    private static async sendToBackend(level: string, message: string, detail?: any) {
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("fas_token") : null;

            const logData = {
                level: level,
                message: message,
                url: typeof window !== "undefined" ? window.location.href : "SSR",
                stack: detail instanceof Error ? detail.stack : JSON.stringify(detail),
            };

            // Header'ları hazırla
            const headers: any = {
                "Content-Type": "application/json",
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            // Native fetch kullanarak dairesel bağımlılığı (apiFetch <=> Logger) önle
            fetch(`${url.endsWith("/") ? url.slice(0, -1) : url}/Log/frontend`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(logData),
            }).catch(() => {
                // Backend'e erişilemezse veya yetkisizse sessizce başarısız ol
            });
        } catch (err) {
            // Loglama sırasında hata oluşursa sonsuz döngüye girmemek için sessiz kal
        }
    }
}

export default Logger;
