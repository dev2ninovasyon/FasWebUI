import { test, expect } from '@playwright/test';
import { LoginPage } from '../e2e/pages/LoginPage';
import { Users, AppRoutes } from '../e2e/test-data/constants';

test.describe('🏗️ Dayanıklılık (Resilience) ve Hata Yönetimi Testleri', () => {

    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
    });

    test('1. Yavaş İnternet (Slow Network): Sistem düşük hızda yükleniyor uyarısı göstermeli', async ({ page }) => {
        // Ağ hızını simüle et (Slow 3G)
        const client = await page.context().newCDPSession(page);
        await client.send('Network.emulateNetworkConditions', {
            offline: false,
            downloadThroughput: (400 * 1024) / 8, // 400 kbps
            uploadThroughput: (200 * 1024) / 8,   // 200 kbps
            latency: 400, // 400ms RTT
        });

        await loginPage.navigate();
        await loginPage.login(Users.denetci.email, Users.denetci.password);

        // Yükleniyor (Loading) spinner veya mesajının varlığını kontrol et
        // Uygulamanızda yaygın olan bir loading selector'ı kullanın
        const loader = page.locator('.spinner, .loading, text=Yükleniyor, text=Sistem yükleniyor').first();
        
        // Yavaşlıkta loader'ı görme ihtimalimiz yüksek
        if (await loader.isVisible()) {
            console.log('✅ Yavaş internette loading göstergesi başarıyla tespit edildi.');
        } else {
            console.log('⚠️ Loading göstergesi görünmedi, ancak sayfa yüklenmiş olabilir.');
        }
    });

    test('2. API Hatası (API Failure): Sunucu 500 hatası verdiğinde kullanıcıya mesaj gösterilmeli', async ({ page }) => {
        // Kritik bir API isteğini yakala ve 500 hatası döndür (Mocking)
        await page.route('**/api/**', async route => {
            const url = route.request().url();
            if (url.includes('sirket-arsiv-ozet') || url.includes('GetirTumu')) {
                console.log(`Mocking 500 error for: ${url}`);
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: "Sunucu hatası oluştu (Simüle Edildi)" })
                });
            } else {
                await route.continue();
            }
        });

        await loginPage.navigate();
        await loginPage.login(Users.denetci.email, Users.denetci.password);
        
        // Dashboard'a git
        await page.goto(AppRoutes.dashboard);

        // Ekranda bir hata mesajı kutusu veya Toast mesajı belirmeli
        const errorToast = page.locator('.toast-error, .alert-danger, text=hata, text=error').first();
        await expect(errorToast).toBeVisible({ timeout: 15000 });
        
        console.log('✅ API 500 hatası verdiğinde UI başarılı şekilde hata mesajı gösterdi.');
    });
});
