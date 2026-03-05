import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Session Stability - 15m Active Navigation", () => {
  test.use({
    storageState: path.join(__dirname, "../../playwright/.auth/user1.json"),
  });

  test("should not redirect to login while user is active for 15 minutes", async ({ page }) => {
    test.setTimeout(16 * 60 * 1000);

    const start = Date.now();
    const durationMs = 15 * 60 * 1000;

    const routes = [
      "/Anasayfa",
      "/Veri/Mizanlar/EDefterMizan",
      "/Hesaplamalar/BeklenenKrediZarari",
      "/Veri/DefterKVBeyannamesiYukleme",
      "/DenetimKanitlari",
      "/Musteri/MusteriIslemleri",
      "/Kullanici/HesapAyarlari",
    ];

    let totalNavigations = 0;
    let unauthorizedCount = 0;
    let idleWarningSeen = false;

    page.on("response", (res) => {
      if (res.status() === 401) {
        unauthorizedCount++;
        // Keep concise logs to avoid excessive output
        console.log(`[401] ${res.request().method()} ${res.url()}`);
      }
    });

    while (Date.now() - start < durationMs) {
      for (const route of routes) {
        if (Date.now() - start >= durationMs) break;

        await page.goto(route, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await expect(page).not.toHaveURL(/\/$/, { timeout: 15_000 });

        const currentUrl = page.url();
        if (currentUrl.endsWith("/") || currentUrl.includes("/Giris")) {
          throw new Error(`Unexpected login redirect detected at route ${route}. Current URL: ${currentUrl}`);
        }

        const warningDialog = page.getByText(/oturum|session/i).first();
        if (await warningDialog.isVisible().catch(() => false)) {
          idleWarningSeen = true;
        }

        totalNavigations++;
        await page.waitForTimeout(12_000);
      }
    }

    const elapsedSec = Math.round((Date.now() - start) / 1000);
    console.log(
      `15m-session-test result: elapsed=${elapsedSec}s, navigations=${totalNavigations}, unauthorized=${unauthorizedCount}, idleWarningSeen=${idleWarningSeen}`
    );

    expect(totalNavigations).toBeGreaterThan(20);
  });
});

