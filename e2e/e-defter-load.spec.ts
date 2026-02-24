import { test, expect } from '@playwright/test';
import * as path from 'path';

const SESSIONS = [
    { name: 'Sirket_test1', denetlenenId: 3, storageFile: 'user1.json' },
    { name: 'Sirket_test2', denetlenenId: 43, storageFile: 'user2.json' },
    { name: 'Sirket_test3', denetlenenId: 12, storageFile: 'user3.json' },
    { name: 'Sirket_test4', denetlenenId: 2, storageFile: 'user4.json' },
    { name: 'Sirket_test5', denetlenenId: 4, storageFile: 'user5.json' },
];

const XML_FOLDER_PATH = 'C:\\Users\\lenov\\Desktop\\XML Kebir, Fatura ve PDF Kurumlar Beyannamesi\\XML KEBİR DEFTERİ';

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
            viewport: { width, height }
        });

        test(`E-Defter Yükleme Testi - ${session.name} (Denetlenen ID: ${session.denetlenenId})`, async ({ page }) => {
            test.setTimeout(600000);

            const now = () => {
                const d = new Date();
                const datePart = d.toLocaleDateString('tr-TR');
                const timePart = d.toLocaleTimeString('tr-TR', { hour12: false });
                const ms = d.getMilliseconds().toString().padStart(3, '0');
                return `${datePart} ${timePart}.${ms}`;
            };
            const runTimedStep = async (stepName: string, fn: () => Promise<void>) => {
                await test.step(stepName, async () => {
                    const startedAt = Date.now();
                    console.log(`[${session.name}] [BAŞLANGIÇ] ${stepName} | Tarih: ${now()}`);
                    try {
                        await fn();
                        const endedAt = Date.now();
                        console.log(`[${session.name}] [BİTİŞ] ${stepName} | Tarih: ${now()} | Süre: ${endedAt - startedAt} ms`);
                    } catch (error) {
                        const endedAt = Date.now();
                        console.error(`[${session.name}] [HATA] ${stepName} | Tarih: ${now()} | Süre: ${endedAt - startedAt} ms`);
                        throw error;
                    }
                });
            };

            const testStartedAt = Date.now();
            console.log(`[${session.name}] [TEST BAŞLANGIÇ] Tarih: ${now()} | Denetlenen ID: ${session.denetlenenId} | Viewport: ${width}x${height}`);

            await runTimedStep('Şirket Oturumunu Hazırla', async () => {
                await page.addInitScript((denetlenenId) => {
                    if (typeof window !== 'undefined') {
                        window.localStorage.setItem('fas_denetlenenId', denetlenenId.toString());
                        window.localStorage.setItem('fas_yil', '2024');
                    }
                }, session.denetlenenId);
                console.log(`[${session.name}] LocalStorage ayarlandı: fas_denetlenenId=${session.denetlenenId}, fas_yil=2024 | Tarih: ${now()}`);
            });

            await runTimedStep('Yükleme Sayfasına Git', async () => {
                const targetUrl = '/Veri/DefterKVBeyannamesiYukleme';
                console.log(`[${session.name}] Sayfaya gidiliyor: ${targetUrl} | Tarih: ${now()}`);
                await page.goto(targetUrl);
                await expect(page).toHaveURL(/.*DefterKVBeyannamesiYukleme/);
                console.log(`[${session.name}] Sayfa doğrulandı: ${targetUrl} | Tarih: ${now()}`);
            });

            await runTimedStep('Dosyaları Seç ve Yükle', async () => {
                console.log(`[${session.name}] File chooser bekleniyor... | Tarih: ${now()}`);
                const fileChooserPromise = page.waitForEvent('filechooser');
                await page.locator('text=Dosyayı buraya sürükleyin veya tıklayıp seçin.').click();
                const fileChooser = await fileChooserPromise;
                console.log(`[${session.name}] File chooser açıldı. | Tarih: ${now()}`);

                console.log(`[${session.name}] ${FILES_TO_UPLOAD.length} adet dosya seçilecek. İlk: ${FILES_TO_UPLOAD[0]} | Son: ${FILES_TO_UPLOAD[FILES_TO_UPLOAD.length - 1]} | Tarih: ${now()}`);
                const uploadStartedAt = Date.now();
                console.log(`[${session.name}] Upload isteği başladı. | Tarih: ${now()}`);
                const [uploadResponse] = await Promise.all([
                    page.waitForResponse(response =>
                        response.url().includes('/Veri/DosyaBilgileriYukle') &&
                        response.request().method() === 'POST',
                        { timeout: 300000 }
                    ),
                    fileChooser.setFiles(FILES_TO_UPLOAD)
                ]);
                const uploadEndedAt = Date.now();
                console.log(`[${session.name}] Upload isteği bitti. | Tarih: ${now()} | Süre: ${uploadEndedAt - uploadStartedAt} ms | Status: ${uploadResponse.status()}`);
                expect(uploadResponse.status()).toBe(200);
            });

            await runTimedStep('İşleme Sürecini Takip Et (Polling)', async () => {
                const pollingStartedAt = Date.now();
                console.log(`[${session.name}] Polling başladı. | Tarih: ${now()}`);

                const startTime = Date.now();
                const maxPollingTime = 1200000;
                let isFinished = false;
                let pollCycle = 0;

                while (Date.now() - startTime < maxPollingTime) {
                    const cycleStartedAt = Date.now();
                    pollCycle++;
                    console.log(`[${session.name}] [POLL BAŞLANGIÇ] Döngü #${pollCycle} | Tarih: ${now()}`);

                    const processedCount = await page.locator('text=Tamamlandı').count();
                    const processingCount = await page.locator('text=İşleniyor').count();
                    const queuedCount = await page.locator('text=Sıraya Alındı.').count();
                    const errorCount = await page.locator('text=Hata Oluştu').count();

                    const successVisible = await page.locator('text=Tüm dosyalar işlendi.').isVisible();
                    console.log(`[${session.name}] Durum -> Tamamlandı: ${processedCount}, İşleniyor: ${processingCount}, Sırada: ${queuedCount}, Hata: ${errorCount}, BaşarıMesajı: ${successVisible} | Tarih: ${now()}`);

                    if (successVisible || (processedCount >= 12 && processingCount === 0 && queuedCount === 0)) {
                        isFinished = true;
                        const cycleEndedAt = Date.now();
                        console.log(`[${session.name}] [POLL BİTİŞ] Döngü #${pollCycle} | Tarih: ${now()} | Süre: ${cycleEndedAt - cycleStartedAt} ms | Sonuç: Tamamlandı`);
                        break;
                    }

                    if (errorCount > 0) {
                        console.warn(`[${session.name}] DİKKAT: ${errorCount} adet dosyada hata oluştu. | Tarih: ${now()}`);
                    }

                    await page.waitForTimeout(30000);
                    const cycleEndedAt = Date.now();
                    console.log(`[${session.name}] [POLL BİTİŞ] Döngü #${pollCycle} | Tarih: ${now()} | Süre: ${cycleEndedAt - cycleStartedAt} ms`);
                }

                const pollingEndedAt = Date.now();
                console.log(`[${session.name}] Polling bitti. | Tarih: ${now()} | Süre: ${pollingEndedAt - pollingStartedAt} ms | Sonuç: ${isFinished ? 'BAŞARILI' : 'ZAMAN AŞIMI'}`);
                expect(isFinished, 'İşlem 20 dakika içinde tamamlanamadı!').toBe(true);

                const finalErrorCount = await page.locator('text=Hata Oluştu').count();
                console.log(`[${session.name}] Final hata sayısı: ${finalErrorCount} | Tarih: ${now()}`);
                expect(finalErrorCount, `${finalErrorCount} adet dosyada hata tespit edildi!`).toBe(0);
            });

            const testEndedAt = Date.now();
            console.log(`[${session.name}] [TEST BİTİŞ] Tarih: ${now()} | Toplam Süre: ${testEndedAt - testStartedAt} ms`);
        });
    });
}
