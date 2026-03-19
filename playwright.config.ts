import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Read environment variables from file.
 * Varsayilan olarak local alinir, ancak "TARGET=staging npx playwright test" ile ezilebilir.
 */
const envFile = process.env.TARGET ? `.env.${process.env.TARGET}` : '.env.local';
dotenv.config({ path: path.resolve(__dirname, envFile) });

function resolveWorkersFromCli() {
  const inlineArg = process.argv.find((arg) => arg.startsWith('--workers='));
  if (inlineArg) {
    const parsed = Number(inlineArg.split('=')[1]);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  const argIndex = process.argv.findIndex((arg) => arg === '--workers');
  if (argIndex >= 0) {
    const parsed = Number(process.argv[argIndex + 1]);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

const cliWorkers = resolveWorkersFromCli();
const resolvedWorkers = process.env.CI ? 1 : Number(cliWorkers || process.env.PLAYWRIGHT_SECURITY_WORKERS || 2);
process.env.PLAYWRIGHT_SECURITY_WORKERS = String(resolvedWorkers);

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: resolvedWorkers,
  reporter: [
    ['html', { outputFolder: 'tests/e2e/reports/playwright-html-report', open: 'never' }],
    ['json', { outputFile: 'tests/e2e/reports/playwright-report.json' }],
  ],

  use: {
    baseURL: process.env.UI_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'cmd /c "start /B dotnet run --project ../FasWebAPI/FasWebApi.csproj && node scripts/playwright-webserver.cjs"',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
  },
});
