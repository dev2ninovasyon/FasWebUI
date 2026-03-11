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

        await page.goto('/');
        await page.waitForSelector('input[id="username"]', { timeout: 60000 });

        await page.waitForFunction(
            () =>
                typeof (window as any).grecaptcha !== 'undefined' &&
                typeof (window as any).grecaptcha.execute === 'function',
            { timeout: 60000 }
        );

        await page.fill('input[id="username"]', user.email);
        await page.fill('input[id="password"]', user.pass);
        await page.click('button[type="submit"]');

        try {
            await Promise.race([
                page.waitForURL('**/Anasayfa', { timeout: 20000 }),
                page.waitForFunction(
                    () => {
                        const sessionToken = window.sessionStorage.getItem('fas_token');
                        const localToken = window.localStorage.getItem('fas_token');
                        return Boolean(sessionToken || localToken);
                    },
                    { timeout: 20000 }
                ),
                page.waitForSelector('.SnackbarItem-message, .notistack-Snackbar', { timeout: 20000 }).then(async (element) => {
                    if (!element) {
                        return;
                    }

                    const errorMessage = await element.innerText();
                    throw new Error(`Giris basarisiz. Kullanici: ${user.email} - Neden: ${errorMessage}`);
                })
            ]);
        } catch (error: any) {
            if (error.message.includes('Giris basarisiz')) {
                throw error;
            }

            throw new Error(
                `Ana sayfaya ulasilamadi veya giris basarisiz oldu. Kullanici: ${user.email}. Orijinal Hata: ${error.message}`
            );
        }

        if (!page.url().includes('/Anasayfa')) {
            await page.goto('/Anasayfa', { waitUntil: 'networkidle' });
        }

        await page.context().storageState({ path: authFile });
    });
}
