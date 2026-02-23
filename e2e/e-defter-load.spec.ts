import { test, expect } from '@playwright/test';
import * as path from 'path';

// !! KULLANIM UYARISI !!
// Testleri calistirmak icin terminalden:
// npx playwright test e-defter-load.spec.ts --workers=5
// komutunu kullanin. Eger workers tanimlanmazsa Playwright bilgisayarin cekirdek sayisina gore (fullyParallel) calistirir.

// Test verisi (Sanal Sirketler ve Kullanici Stateleri)
const SESSIONS = [
    { name: 'Sirket_test1', denetlenenId: 3, storageFile: 'user1.json' },
    { name: 'Sirket_test2', denetlenenId: 43, storageFile: 'user2.json' },
    { name: 'Sirket_test3', denetlenenId: 12, storageFile: 'user3.json' },
    { name: 'Sirket_test4', denetlenenId: 2, storageFile: 'user4.json' },
    { name: 'Sirket_test5', denetlenenId: 4, storageFile: 'user5.json' },
];

const XML_FOLDER_PATH = 'C:\\Users\\lenov\\Desktop\\XML Kebir, Fatura ve PDF Kurumlar Beyannamesi\\XML KEBİR DEFTERİ';

// Yüklenecek 12 adet dosyanin listesi
const FILES_TO_UPLOAD = [
    '6640804404-202401-K-000000.xml',
    '6640804404-202402-K-000000.xml',
    '6640804404-202403-K-000000.xml',
    '6640804404-202404-K-000000.xml',
    '6640804404-202405-K-000000.xml',
    '6640804404-202406-K-000000.xml',
    '6640804404-202407-K-000000.xml',
    '6640804404-202408-K-000000.xml',
    '6640804404-202409-K-000000.xml',
    '6640804404-202410-K-000000.xml',
    '6640804404-202411-K-000000.xml',
    '6640804404-202412-K-000000.xml',
].map(fileName => path.join(XML_FOLDER_PATH, fileName));

for (let i = 0; i < SESSIONS.length; i++) {
    const session = SESSIONS[i];

    test.describe(`Worker: ${session.name}`, () => {
        const width = Math.floor(1920 / 5);
        const height = 1000;

        test.use({
            storageState: path.join(__dirname, `../playwright/.auth/${session.storageFile}`),
            viewport: { width: width, height: height }
        });

        test(`E-Defter Yükleme Testi - ${session.name} (Denetlenen ID: ${session.denetlenenId})`, async ({ page }) => {
            test.setTimeout(600000);

            await test.step('Şirket Oturumunu Hazırla', async () => {
                await page.addInitScript((denetlenenId) => {
                    if (typeof window !== 'undefined') {
                        window.localStorage.setItem('fas_denetlenenId', denetlenenId.toString());
                        window.localStorage.setItem('fas_yil', '2024');
                    }
                }, session.denetlenenId);
                console.log(`[${session.name}] Şirket ID ${session.denetlenenId} için hazırlandı.`);
            });

            await test.step('Yükleme Sayfasına Git', async () => {
                const targetUrl = `/Veri/DefterKVBeyannamesiYukleme`;
                await page.goto(targetUrl);
                await expect(page).toHaveURL(/.*DefterKVBeyannamesiYukleme/);
                console.log(`[${session.name}] Sayfaya ulaştı: ${targetUrl}`);
            });

            await test.step('Dosyaları Seç ve Yükle', async () => {
                const fileChooserPromise = page.waitForEvent('filechooser');
                await page.locator('text=Dosyayı buraya sürükleyin veya tıklayıp seçin.').click();
                const fileChooser = await fileChooserPromise;

                console.log(`[${session.name}] ${FILES_TO_UPLOAD.length} adet dosya yükleniyor...`);
                await fileChooser.setFiles(FILES_TO_UPLOAD);

                // API yüklemesini bekle
                const uploadResponse = await page.waitForResponse(response =>
                    response.url().includes('DosyaBilgileriYukle') && response.request().method() === 'POST',
                    { timeout: 300000 }
                );
                expect(uploadResponse.status()).toBe(200);
                console.log(`[${session.name}] Dosyalar sunucuya yüklendi.`);
            });

            await test.step('İşleme Sürecini Takip Et (Polling)', async () => {
                console.log(`[${session.name}] Polling başlatıldı...`);

                const startTime = Date.now();
                const MAX_POLLING_TIME = 1200000; // 20 dakika
                let isFinished = false;

                while (Date.now() - startTime < MAX_POLLING_TIME) {
                    // Sayfadaki durumları kontrol et
                    const processedCount = await page.locator('text=Tamamlandı').count();
                    const processingCount = await page.locator('text=İşleniyor').count();
                    const queuedCount = await page.locator('text=Sıraya Alındı.').count();
                    const errorCount = await page.locator('text=Hata Oluştu').count();

                    console.log(`[${session.name}] Durum -> Tamamlandı: ${processedCount}, İşleniyor: ${processingCount}, Sırada: ${queuedCount}, Hata: ${errorCount}`);

                    // Başarı mesajı veya tüm dosyaların tamamlanması
                    const successVisible = await page.locator('text=Tüm dosyalar işlendi.').isVisible();

                    if (successVisible || (processedCount >= 12 && processingCount === 0 && queuedCount === 0)) {
                        console.log(`[${session.name}] İşlem başarıyla tamamlandı.`);
                        isFinished = true;
                        break;
                    }

                    if (errorCount > 0) {
                        console.warn(`[${session.name}] DİKKAT: ${errorCount} adet dosyada hata oluştu!`);
                    }

                    await page.waitForTimeout(30000); // 30 saniye bekle
                }

                expect(isFinished, 'İşlem 20 dakika içinde tamamlanamadı!').toBe(true);

                const finalErrorCount = await page.locator('text=Hata Oluştu').count();
                expect(finalErrorCount, `${finalErrorCount} adet dosyada hata tespit edildi!`).toBe(0);
            });
        });
    });
}
