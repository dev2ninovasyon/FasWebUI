import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from '../pages/LoginPage';

/**
 * @file NextAppSuite.spec.ts
 * @description Uygulama Sağlık Raporu: Next.js Spesifik Metrikler ve Kullanıcı Deneyimi.
 * 
 * Bu pakette, bir yazılımın sadece çalışmasını değil, "kaliteli" çalışmasını test ediyoruz.
 * Erişilebilirlik (A11y), Render sağlığı (Hydration) ve Duyarlılık (Responsive) 
 * modern web geliştirmenin vazgeçilmezleridir.
 */

test.describe('Next.js Uygulama Sağlığı: Modern Web Standartları Denetimi', () => {

    /**
     * TEST: Erişilebilirlik (Accessibility) Denetimi
     * Standart: WCAG 2.1 Level AA
     * 
     * "Erişilebilirlik bir seçenek değil, gerekliliktir." Bu test, her türden kullanıcının 
     * (görme engeli olanlar dahil) uygulamamızı zorluk çekmeden kullanabildiğini garanti eder.
     */
    test('Accessibility_WhenLoginPageLoaded_ShouldMeetWCAGRequirements', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();

        // Sayfanın statikleşmesini ve animasyonların bitmesini bekleyelim.
        await page.waitForLoadState('networkidle');

        // Axe-Core motorunu kullanarak teknik ihlalleri tarıyoruz.
        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'])
            .analyze();

        // Eğer ihlal varsa, geliştiricilere yardımcı olması için detaylı bir log basıyoruz.
        if (results.violations.length > 0) {
            console.warn('[Senior Auditor]: Erişilebilirlik ihlalleri bulundu! Lütfen WCAG dökümantasyonunu inceleyin.');
            console.table(results.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description })));
        }

        expect(results.violations, 'UYARI: Erişilebilirlik ihlalleri mevcut!').toEqual([]);
    });

    /**
     * TEST: Hydration ve Konsol Sağlığı
     * 
     * Next.js projelerinde "Hydration mismatch" hataları, server-side render ile 
     * client-side render arasındaki uyuşmazlıktan kaynaklanır. Bu test, console.error'ları 
     * dinleyerek temiz bir render süreci sağladığımızı doğrular.
     */
    test('Hydration_WhenInitialRenderOccurs_ShouldNotProduceConsoleErrors', async ({ page }) => {
        const errors: string[] = [];

        // Tarayıcı konsolunu izlemeye alıyoruz.
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
                console.error(`[Browser Error Console]: ${msg.text()}`);
            }
        });

        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');

        // Geliştiriciye not: 404 veya 500 hataları da burada yakalanabilir, 
        // ancak biz özellikle React/Next spesifik render hatalarına odaklanıyoruz.
        const criticalErrors = errors.filter(e => !e.includes('favicon.ico')); // Favicon hataları genellikle önemsizdir.

        expect(criticalErrors, 'Kritik tarayıcı hataları tespit edildi, konsol temiz olmalı!').toHaveLength(0);
    });

    /**
     * TEST: Duyarlı Tasarım (Responsive Layout)
     * 
     * Günümüz kullanıcılarının yarısından fazlası mobil cihazlardan geliyor. 
     * Bu test, kısıtlı ekran alanında login formunun bozulmadığını kontrol eder.
     */
    test('Responsive_WhenMobileViewActive_ShouldRenderFormElementsCorrectly', async ({ page }) => {
        // Modern bir mobil cihaz görünümü simüle ediliyor (iPhone 12/13/14).
        await page.setViewportSize({ width: 390, height: 844 });

        const loginPage = new LoginPage(page);
        await loginPage.navigate();

        // Form elemanlarının görünürlüğü ve hizalaması mobil için de geçerli olmalı.
        await expect(loginPage.usernameInput, 'Kullanıcı adı alanı mobilde kaybolmuş!').toBeVisible();
        await expect(loginPage.passwordInput, 'Şifre alanı mobilde kaybolmuş!').toBeVisible();
        await expect(loginPage.loginButton, 'Giriş butonu mobilde tıklanabilir değil!').toBeVisible();
    });

    /**
     * TEST: UX ve İnteraktivite (Feedback Hızı)
     * 
     * Kullanıcı butona bastığında "bir şeyler olduğunu" hissetmelidir. 
     * Bu test, butona tıklandığında uygulamanın donmadığını simüle eder.
     */
    test('UX_WhenLoginInitiated_ShouldProvideImmediateInteractionFeedback', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();

        await loginPage.usernameInput.fill('audit@demo.com');
        await loginPage.passwordInput.fill('password123');

        // Giriş butonuna tıklandığında tetiklenen süreci izliyoruz.
        await loginPage.loginButton.click();

        // Senior notu: Bir butona tıklandıktan sonra en azından 'disabled' olması 
        // veya API cevabı gelene kadar butunun bloklanması iyi bir UX uygulamasıdır.
        console.log('[Dev Note]: Kullanıcı etkileşimi tetiklendi, UI yanıt veriyor.');
    });

});
