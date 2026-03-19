import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { Users, AppRoutes } from './test-data/constants';

test.describe('Kurumsal UI & E2E Ana Akis Testleri', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
    });

    test('1. Login: Kullanici gercek auth bilgileriyle sisteme girebilmeli', async ({ page }) => {
        console.log('--- TEST START: Login ---');
        await loginPage.navigate();
        console.log('Navigation complete, starting login sequence...');
        await loginPage.login(Users.denetci.email, Users.denetci.password);
        console.log('Login sequence call finished, verifying URL...');

        await expect(page).toHaveURL(/.*Anasayfa|.*Dashboard/i, { timeout: 30000 });
        console.log('--- TEST FINISHED: Login SUCCESS ---');
    });

    test('2. Dashboard (Anasayfa): Giris sonrasi kritik bilesenler yuklenmelidir', async ({ page }) => {
        await loginPage.navigate();
        await loginPage.login(Users.denetci.email, Users.denetci.password);
        await page.waitForURL(/.*Anasayfa|.*Dashboard/i, { timeout: 30000 });
        await page.waitForLoadState('networkidle');

        await page.goto(AppRoutes.dashboard);

        const dashboardBody = page.locator('body');
        await expect(dashboardBody).toBeVisible();

        let apiErrorFound = false;
        page.on('response', (response) => {
            if (response.status() >= 400 && response.url().toLowerCase().includes('api')) {
                apiErrorFound = true;
            }
        });

        await page.waitForTimeout(3000);
        expect(apiErrorFound).toBe(false);
    });

    test('3. Liste Ekrani ve Filtreleme: Kullanici sayfalari grid uzerinden gorebilmeli', async ({ page }) => {
        await loginPage.navigate();
        await loginPage.login(Users.denetci.email, Users.denetci.password);
        await page.waitForURL(/.*Anasayfa|.*Dashboard/i, { timeout: 30000 });

        await page.goto('/Veri/Fatura', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/Veri\/Fatura/i, { timeout: 20000 });

        const pageLoadedMarker = page
            .locator('text=/Fatura Yükleme|Fatura Yukleme|Dosya Yükle|Dosya Yukle|Yükleme İşlemleri|Yukleme Islemleri/i')
            .first();
        await expect(pageLoadedMarker).toBeVisible({ timeout: 20000 });
        console.log('Fatura yukleme sayfasi yuklendi.');

        const tableElement = page.locator('table').first();
        await expect(tableElement).toBeVisible({ timeout: 15000 });
        console.log('Veri tablosu goruldu.');
    });

    test('4. Session Dayanikliligi ve Logout', async ({ page, context }) => {
        await loginPage.navigate();
        await loginPage.login(Users.denetci.email, Users.denetci.password);
        await page.waitForURL(/.*Anasayfa/);

        const newPage = await context.newPage();
        await newPage.goto(AppRoutes.dashboard);
        await expect(newPage).toHaveURL(/.*Anasayfa/);

        const logoutBtn = newPage.locator('text=Çıkış Yap, text=Cikis Yap, text=Logout, [title="Çıkış"], [title="Cikis"]').first();
        if (await logoutBtn.isVisible().catch(() => false)) {
            await logoutBtn.click();
            await expect(newPage).toHaveURL(/.*login/i);
        }
    });
});
