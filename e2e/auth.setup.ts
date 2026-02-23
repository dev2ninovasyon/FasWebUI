import { test as setup } from '@playwright/test';
import * as path from 'path';

const USERS = [
    { email: 'test1@2ninovasyon.com', pass: 'bwI#B]WJhj', file: 'user1.json' },
    { email: 'test2@2ninovasyon.com', pass: 'bwI#B]WJhj', file: 'user2.json' },
    { email: 'test3@2ninovasyon.com', pass: 'bwI#B]WJhj', file: 'user3.json' },
    { email: 'test4@2ninovasyon.com', pass: 'bwI#B]WJhj', file: 'user4.json' },
    { email: 'test5@2ninovasyon.com', pass: 'bwI#B]WJhj', file: 'user5.json' }
];

for (const user of USERS) {
    setup(`authenticate ${user.email}`, async ({ page }) => {
        const authFile = path.join(__dirname, `../playwright/.auth/${user.file}`);

        // 1. Login sayfasina git
        await page.goto('/Giris');

        // 2. Form doldurma
        await page.fill('input[id="username"]', user.email);
        await page.fill('input[id="password"]', user.pass);

        // 3. Login ol
        await page.click('button[type="submit"]');

        // 4. Ekranda giriş başarısız hata mesajı (snackbar) çıkarsa veya Anasayfaya yönlenmezse kontrol et
        try {
            // Ya anasayfaya gidecek, ya da ekranda bir hata kutucuğu belirecek
            await Promise.race([
                page.waitForURL('**/Anasayfa', { timeout: 15000 }),
                // Projenizdeki snackbar veya hata componenti. Genelde '.SnackbarItem-message' veya role="alert" olur
                page.waitForSelector('.SnackbarItem-message, .notistack-Snackbar', { timeout: 15000 }).then(async (el) => {
                    if (el) {
                        const errorMsg = await el.innerText();
                        throw new Error(`Giriş Başarısız. Kullanıcı: ${user.email} - Neden: ${errorMsg}`);
                    }
                })
            ]);
        } catch (e: any) {
            // Eğer URL'yi beklerken timeout'a da düşerse:
            if (e.message.includes('Giriş Başarısız')) throw e;
            throw new Error(`Ana sayfaya ulaşılamadı veya giriş başarısız oldu. Kullanıcı: ${user.email}. \nOrijinal Hata: ${e.message}`);
        }

        // 5. Auth state'i ayrilan dosyaya kaydet
        await page.context().storageState({ path: authFile });
    });
}
