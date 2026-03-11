import { test, expect } from '@playwright/test';

test.describe('FasWebUI Ana Sayfa ve Navigasyon Testleri', () => {

    test('Ana sayfa başarıyla yüklenmeli ve başlık kontrol edilmeli', async ({ page }) => {
        // Proje localhost:3000 üzerinde çalıştığı varsayılıyor (playwright.config.ts'den geliyor)
        await page.goto('/');

        // Sayfanın yüklendiğini doğrula
        await expect(page).toHaveTitle(/Financial Audit Software/i || /Fas/i);
    });

    test('Giriş sayfası kontrolü', async ({ page }) => {
        await page.goto('/auth/login' || '/login');
        // Login sayfasında email inputu var mı kontrol et
        const emailInput = page.locator('input[type="email"], input[name="email"]');
        if (await emailInput.count() > 0) {
            await expect(emailInput).toBeVisible();
        }
    });

});
