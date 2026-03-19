// tests/e2e/utils/helpers.ts
import { Page, expect } from '@playwright/test';

// Ornek bir form kayit (update) senaryosu 
export async function testFormUpdate(page: Page, targetUrl: string, submitLocator: string, successMessage: string) {
    await page.goto(targetUrl);
    await page.waitForLoadState('networkidle');

    // Ilk gorunen inputa random deger girer ('Deneme x')
    const input = page.locator('input[type="text"]').first();
    if (await input.isVisible()) {
        const val = await input.inputValue();
        await input.fill(val + ' - Test Edildi');
    }

    // Gercek API'ye POST/PUT gidisi icin Submit tusuna bas
    await page.click(submitLocator);
    
    // Uygulama basarili kaydetti mi?
    const successToast = page.locator(`text=${successMessage}`).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });
}
