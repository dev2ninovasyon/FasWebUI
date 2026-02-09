import { Page, Locator, expect } from '@playwright/test';

/**
 * @class LoginPage
 * @description Giriş sayfası (Login) için Page Object Model (POM) yapısı.
 * 
 * "Kod, sadece makineler tarafından çalıştırılmak için değil, insanlar tarafından anlaşılmak içindir."
 * Bu sınıfı, login sayfasındaki UI değişimlerinden etkilenmemek ve test kodunu kirletmemek için 
 * merkezi bir 'Single Source of Truth' (Tek Gerçeklik Kaynağı) olarak kullanıyoruz.
 */
export class LoginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorSnackbar: Locator;

    constructor(page: Page) {
        this.page = page;

        // Element seçimlerinde id kullanmayı tercih ediyoruz; çünkü id'ler, class isimlerine göre 
        // daha az değişme eğilimindedir ve testi daha stabil tutar.
        this.usernameInput = page.locator('input[id="username"]');
        this.passwordInput = page.locator('input[id="password"]');
        this.loginButton = page.locator('button[type="submit"]');

        // Hata mesajlarını yakalamak bazen zordur. Burada, snackbar veya modal içinde geçebilecek 
        // anahtar kelimeleri (case-insensitive) tarayarak esnek bir yapı kurduk.
        // Geliştiriciler bu metinleri değiştirse bile regex sayesinde yakalama ihtimalimiz artıyor.
        this.errorSnackbar = page.locator('div[role="alert"], .MuiAlert-message, [class*="snackbar"], [class*="error"]');
    }

    /**
     * Uygulamanın giriş noktasına gider.
     */
    async navigate() {
        await this.page.goto('/');
    }

    /**
     * @method login
     * @description Kullanıcı credentials'larını doldurur ve girişi tetikler. 
     * useEnter parametresi, kullanıcının butona tıklamak yerine klavyeden 'Enter' 
     * basma alışkanlığını simüle etmek için eklendi.
     */
    async login(email: string, password: string, useEnter: boolean = false) {
        // Formu doldururken bazen inputların focus olması zaman alabilir, Playwright bunu otomatik bekler.
        await this.usernameInput.fill(email);
        await this.passwordInput.fill(password);

        if (useEnter) {
            // Klavye simülasyonu, form focus yönetimi için bazen daha gerçekçi bir test sunar.
            await this.page.keyboard.press('Enter');
        } else {
            await this.loginButton.click();
        }
    }

    /**
     * Girişin başarılı olduğu ve kullanıcının ana sayfaya yönlendirildiği anı bekler.
     */
    async expectLoginRedirect() {
        await expect(this.page).toHaveURL('/Anasayfa');
    }

    /**
     * @method expectErrorMessageVisible
     * @description Hatalı giriş veya sistem uyarılarında çıkan hata kutusunu doğrular.
     * Timeout değerini varsayılan olarak yüksek tutuyoruz ki yavaş networklerde test 'flaky' olmasın.
     */
    async expectErrorMessageVisible(timeout: number = 10000) {
        // Hata mesajı görünene kadar bekliyoruz. 
        // Not: .first() kullanıyoruz çünkü aynı anda birden fazla snackbar tetiklenebilir.
        const errorElement = this.errorSnackbar.first();
        await expect(errorElement).toBeVisible({ timeout });

        const message = await errorElement.innerText();
        console.log(`[CI/CD Logger]: Yakalanan hata mesajı -> "${message}"`);
    }
}
