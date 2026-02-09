import { Page, expect } from '@playwright/test';

/**
 * @class SecurityHelper
 * @description Güvenlik denetimleri için geliştirilmiş yardımcı fonksiyonlar kümesi.
 * 
 * Bu sınıf, uygulamamızın güvenlik katmanlarını (XSS koruması, Cookie izolasyonu, vb.) 
 * programatik olarak doğrulamak için tasarlanmıştır. "Güvenlik, bir ürün özelliği değil, bir temel haktır."
 */
export class SecurityHelper {

    /**
     * HttpOnly cookie'lerin JavaScript tarafına sızıp sızmadığını kontrol eder.
     * Hatırlatma: HttpOnly cookie'ler document.cookie içinde GÖRÜNMEMELİDİR. 
     * Eğer görünüyorsa, 'fas_token' bir saldırgan tarafından çalınabilir demektir (XSS riski).
     */
    static async checkHttpOnlyCookies(page: Page) {
        const cookies = await page.evaluate(() => document.cookie);

        // Eğer bu ifadeler hata verirse, backend'in cookie set etme parametrelerini 
        // (httpOnly: true) acilen gözden geçirmeliyiz.
        expect(cookies, 'Kritik uyarı: Auth tokenları JavaScript tarafından erişilebilir durumda!').not.toContain('fas_token');
        expect(cookies, 'Kritik uyarı: Refresh token JavaScript tarafına sızmış!').not.toContain('fas_refreshToken');
    }

    /**
     * localStorage üzerinde hassas veri (token vb.) kalıntısı olup olmadığını denetler.
     * Token-Storage Hardening sürecinden sonra artık buralarda token görmeyi beklemiyoruz.
     */
    static async checkNoSensitiveDataInLocalStorage(page: Page) {
        const token = await page.evaluate(() => localStorage.getItem('fas_token'));
        expect(token, 'Geliştirici notu: Token hala localStorage içinde duruyor, kaldırılmalı.').toBeNull();
    }

    /**
     * API isteklerini yakalamak için sessiz bir dinleyici (Interceptor) sağlar.
     * Özellikle Header doğrulamaları yapmadan önce isteği yakalamak için kullanışlıdır.
     */
    static async interceptApiRequest(page: Page, path: string) {
        return page.waitForRequest(request =>
            request.url().includes(path) && request.method() === 'GET'
        );
    }

    /**
     * Giden API isteklerinin beklenen 'Custom Header'ları (X-Denetlenen-Id gibi) 
     * taşıyıp taşımadığını doğrular. Bu, Frontend-Backend senkronizasyonunun en saf halidir.
     */
    static async verifyCustomHeader(page: Page, path: string, headerName: string, expectedValue: string) {
        const request = await this.interceptApiRequest(page, path);
        const headers = request.headers();

        // Header isimleri genellikle case-insensitive'dir, ancak biz garantiye almak için küçük harf kullanıyoruz.
        expect(headers[headerName.toLowerCase()]).toBe(expectedValue);
    }
}
