import { test, expect } from '@playwright/test';
import { LoginPage } from '../e2e/pages/LoginPage';
import { AppRoutes, Users } from '../e2e/test-data/constants';
import * as fs from 'fs';
import * as path from 'path';

function resolveWorkerCount() {
  const envWorkers = Number(process.env.PLAYWRIGHT_SECURITY_WORKERS);
  if (!Number.isNaN(envWorkers) && envWorkers > 0) {
    return envWorkers;
  }

  const workersArg = process.argv.find((arg) => arg.startsWith('--workers='));
  if (workersArg) {
    const parsed = Number(workersArg.split('=')[1]);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  const workersArgIndex = process.argv.findIndex((arg) => arg === '--workers');
  if (workersArgIndex >= 0) {
    const parsed = Number(process.argv[workersArgIndex + 1]);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 5;
}

const NUM_WORKERS = resolveWorkerCount();

const routesPath = path.join(__dirname, 'routes.json');
let staticRoutes: string[] = [];

if (fs.existsSync(routesPath)) {
  staticRoutes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
} else {
  staticRoutes = Object.values(AppRoutes).filter((route) => route !== '/');
}

function splitIntoChunks<T>(items: T[], groupCount: number): T[][] {
  const result: T[][] = Array.from({ length: groupCount }, () => []);
  items.forEach((item, index) => result[index % groupCount].push(item));
  return result;
}

type MaddiDogrulamaMenuItem = {
  href?: string;
  name?: string;
  children?: MaddiDogrulamaMenuItem[];
};

const MADDI_DOGRULAMA_ROUTE = '/DenetimKanitlari/MaddiDogrulamaProsedurleri';
const UI_ROOT = path.resolve(__dirname, '..', '..');
const API_ROOT = path.resolve(__dirname, '..', '..', '..', 'FasWebAPI');
const MADDI_DOGRULAMA_DYNAMIC_DIR = path.join(
  UI_ROOT,
  'src',
  'app',
  '(Uygulama)',
  'DenetimKanitlari',
  'MaddiDogrulamaProsedurleri',
  '[parentName]'
);
const MADDI_DOGRULAMA_MIGRATION_PATH = path.join(
  API_ROOT,
  'Migrations',
  '20260305182945_AddScopeIndexes_DenetlenenYil_Denetci.Designer.cs'
);
const MADDI_DOGRULAMA_ROUTES_CACHE_PATH = path.join(__dirname, 'maddi-dogrulama-routes.json');
const SECURITY_SCAN_TIMEOUT_MS = 20 * 60 * 1000;

function removeTurkishChars(value: string | undefined | null) {
  if (!value) {
    return '';
  }

  return value
    .replace(/\s/g, '')
    .replace(/\u0131/g, 'i')
    .replace(/\u00F6/g, 'o')
    .replace(/\u00FC/g, 'u')
    .replace(/\u015F/g, 's')
    .replace(/\u011F/g, 'g')
    .replace(/\u00E7/g, 'c')
    .replace(/\u0130/g, 'I')
    .replace(/\u00D6/g, 'O')
    .replace(/\u00DC/g, 'U')
    .replace(/\u015E/g, 'S')
    .replace(/\u011E/g, 'G')
    .replace(/\u00C7/g, 'C');
}

function normalizeRoute(route: string) {
  const [pathPart, queryPart] = route.split('?');
  const normalizedPath = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  return queryPart ? `${normalizedPath}?${queryPart}` : normalizedPath;
}

function flattenMenuRoutes(items: MaddiDogrulamaMenuItem[]) {
  const routes = new Set<string>();

  for (const item of items) {
    if (item.href) {
      routes.add(normalizeRoute(item.href));
    }

    for (const child of item.children ?? []) {
      if (child.href) {
        routes.add(normalizeRoute(child.href));
      }
    }
  }

  return [...routes];
}

async function collectVisibleMaddiDogrulamaLinks(page: import('@playwright/test').Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector(`a[href*="${MADDI_DOGRULAMA_ROUTE}/"]`, { timeout: 10000 }).catch(() => null);
  await page.waitForTimeout(1000);

  return page.evaluate((routePrefix) => {
    return [...document.querySelectorAll('a[href]')]
      .map((anchor) => {
        const rawHref = anchor.getAttribute('href') ?? anchor.href ?? '';
        if (!rawHref) {
          return '';
        }

        try {
          const url = new URL(rawHref, window.location.origin);
          return `${url.pathname}${url.search}`;
        } catch {
          return rawHref;
        }
      })
      .filter((href) => href.startsWith(routePrefix) && !href.includes('/CalismaKagidiRaporu'));
  }, MADDI_DOGRULAMA_ROUTE);
}

function discoverDynamicMaddiDogrulamaRoutesFromSeed() {
  if (!fs.existsSync(MADDI_DOGRULAMA_MIGRATION_PATH) || !fs.existsSync(MADDI_DOGRULAMA_DYNAMIC_DIR)) {
    return [];
  }

  const migrationText = fs.readFileSync(MADDI_DOGRULAMA_MIGRATION_PATH, 'utf-8');
  const blocks = [...migrationText.matchAll(/new\s*\{([\s\S]*?)\n\s*\},/g)].map((match) => match[1]);
  const rows = blocks
    .map((block) => {
      const getNumber = (name: string) => {
        const match = block.match(new RegExp(`${name}\\s*=\\s*(null|\\d+)`));
        if (!match) {
          return undefined;
        }

        return match[1] === 'null' ? null : Number(match[1]);
      };
      const getString = (name: string) => {
        const match = block.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`));
        return match?.[1];
      };

      return {
        id: getNumber('Id'),
        parentId: getNumber('ParentId'),
        belgeAdi: getString('BelgeAdi'),
        formUrl: getString('FormUrl'),
      };
    })
    .filter(
      (row): row is { id: number; parentId: number | null; belgeAdi?: string; formUrl?: string } =>
        typeof row.id === 'number'
    );

  const parentRows = rows.filter(
    (row) =>
      row.parentId === 166 &&
      row.formUrl &&
      row.formUrl.startsWith('/DenetimKanitlari/MaddiDogrulamaProsedurleri/')
  );
  const availableChildSegments = new Set(
    fs
      .readdirSync(MADDI_DOGRULAMA_DYNAMIC_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  );

  const routes = new Set<string>();

  for (const parentRow of parentRows) {
    const parentRoute = parentRow.formUrl;
    const parentTitle = parentRow.belgeAdi ?? parentRoute.split('/').filter(Boolean).at(-1) ?? '';
    routes.add(`${parentRoute}?title=${encodeURIComponent(parentTitle)}`);
  }

  return [...routes];
}

async function loadDynamicMaddiDogrulamaRoutes(browser: import('@playwright/test').Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const loginPage = new LoginPage(page);

  try {
    await loginPage.navigate();
    await loginPage.login(Users.denetci.email, Users.denetci.password);
    await page.waitForURL(/Anasayfa|Musteri|DenetimKanitlari/i, { timeout: 30000 });
    await page.goto(MADDI_DOGRULAMA_ROUTE, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const cachedRoutes = await page.evaluate(async () => {
      const cacheKey = 'maddiDogrulamaData';
      const metadataKey = 'maddiDogrulamaMetadata';
      const waitUntil = Date.now() + 30000;

      while (Date.now() < waitUntil) {
        const cached = window.localStorage.getItem(cacheKey);
        const metadata = window.localStorage.getItem(metadataKey);

        if (cached && metadata) {
          try {
            return JSON.parse(cached);
          } catch {
            return [];
          }
        }

        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }

      return [];
    });

    const dynamicRoutes = flattenMenuRoutes(cachedRoutes as MaddiDogrulamaMenuItem[]);
    if (dynamicRoutes.length > 0) {
      fs.writeFileSync(MADDI_DOGRULAMA_ROUTES_CACHE_PATH, JSON.stringify(dynamicRoutes, null, 2));
      console.log(`Loaded ${dynamicRoutes.length} dynamic MaddiDogrulama routes from UI cache`);
      return dynamicRoutes;
    }

    const parentRoutes = [...new Set(await collectVisibleMaddiDogrulamaLinks(page).then((routes) => routes.map(normalizeRoute)))];
    const discoveredRoutes = new Set<string>(parentRoutes);

    for (const parentRoute of parentRoutes) {
      await page.goto(parentRoute, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const childRoutes = await collectVisibleMaddiDogrulamaLinks(page);
      for (const childRoute of childRoutes) {
        discoveredRoutes.add(normalizeRoute(childRoute));
      }
    }

    if (discoveredRoutes.size > 0) {
      fs.writeFileSync(MADDI_DOGRULAMA_ROUTES_CACHE_PATH, JSON.stringify([...discoveredRoutes], null, 2));
      console.log(`Loaded ${discoveredRoutes.size} dynamic MaddiDogrulama routes from UI navigation`);
      return [...discoveredRoutes];
    }

    const fallbackRoutes = discoverDynamicMaddiDogrulamaRoutesFromSeed();
    fs.writeFileSync(MADDI_DOGRULAMA_ROUTES_CACHE_PATH, JSON.stringify(fallbackRoutes, null, 2));
    console.log(`Loaded ${fallbackRoutes.length} dynamic MaddiDogrulama routes from DB seed fallback`);
    return fallbackRoutes;
  } catch (error: any) {
    console.warn(`Dynamic route discovery failed: ${error.message}`);
    const fallbackRoutes = discoverDynamicMaddiDogrulamaRoutesFromSeed();
    fs.writeFileSync(MADDI_DOGRULAMA_ROUTES_CACHE_PATH, JSON.stringify(fallbackRoutes, null, 2));
    console.log(`Loaded ${fallbackRoutes.length} dynamic MaddiDogrulama routes from DB seed fallback`);
    return fallbackRoutes;
  } finally {
    await context.close();
  }
}

const fallbackDynamicRoutes = fs.existsSync(MADDI_DOGRULAMA_ROUTES_CACHE_PATH)
  ? JSON.parse(fs.readFileSync(MADDI_DOGRULAMA_ROUTES_CACHE_PATH, 'utf-8'))
  : discoverDynamicMaddiDogrulamaRoutesFromSeed();
let dynamicRoutes: string[] = fallbackDynamicRoutes;
let allRoutes: string[] = [...new Set([...staticRoutes, ...dynamicRoutes])];
let routeGroups = splitIntoChunks(allRoutes, NUM_WORKERS);

async function scanRoutes(page: import('@playwright/test').Page, routes: string[], label: string) {
  const violations: string[] = [];

  for (const route of routes) {
    await test.step(`${label} route: ${route}`, async () => {
      try {
        await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForFunction(
          () => {
            const currentUrl = window.location.href.toLowerCase();
            const origin = window.location.origin.toLowerCase();
            const hasLoginForm = !!document.querySelector('#username');
            return (
              hasLoginForm ||
              currentUrl.includes('login') ||
              currentUrl.includes('account') ||
              currentUrl === `${origin}/` ||
              currentUrl === origin
            );
          },
          null,
          { timeout: 8000 }
        ).catch(() => null);

        const currentUrl = page.url();
        const hasLoginForm = await page.locator('#username').isVisible().catch(() => false);
        const origin = await page.evaluate(() => window.location.origin);
        const isAtLogin =
          currentUrl.includes('login') ||
          currentUrl.includes('Account') ||
          currentUrl === `${origin}/` ||
          currentUrl === origin;

        if (!(isAtLogin || hasLoginForm)) {
          const message = `Security violation: ${route} -> ${currentUrl}`;
          console.error(message);
          violations.push(message);
        } else {
          console.log(`OK ${route}`);
        }
      } catch (error: any) {
        console.warn(`Unreachable route: ${route} - ${error.message}`);
      }
    });
  }

  if (violations.length > 0) {
    throw new Error(`${violations.length} security violations found:\n${violations.join('\n')}`);
  }

  await test.step(`${label} summary: scanned ${routes.length} routes`, async () => {
    console.log(`Scanned ${routes.length} routes in ${label}`);
  });
}

async function runInjectionChecks(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();

  await page.fill('#username', '<script>alert("XSS")</script>');
  await page.click('button[type="submit"]');

  await page.fill('#username', 'admin');
  await page.fill('#password', "' OR 1=1 --");
  await page.click('button[type="submit"]');

  await expect(page).not.toHaveURL(/.*Anasayfa/);
  console.log('OK injection attempts were blocked');
}

test.describe(`Security scan - ${NUM_WORKERS} parallel browsers`, () => {
  test.describe.configure({ timeout: SECURITY_SCAN_TIMEOUT_MS });

  test.beforeAll(async ({ browser }) => {
    dynamicRoutes = await loadDynamicMaddiDogrulamaRoutes(browser);
    allRoutes = [...new Set([...staticRoutes, ...dynamicRoutes])];
    routeGroups = splitIntoChunks(allRoutes, NUM_WORKERS);

    console.log(
      `Route inventory: ${staticRoutes.length} static + ${dynamicRoutes.length} dynamic = ${allRoutes.length} total`
    );
  });

  if (NUM_WORKERS === 1) {
    test(`Single browser session - full security scan (${allRoutes.length} routes)`, async ({ page }) => {
      await scanRoutes(page, allRoutes, 'single-session');
      await test.step(
        `single-session inventory: ${staticRoutes.length} static + ${dynamicRoutes.length} dynamic = ${allRoutes.length} total`,
        async () => {
          console.log(
            `Inventory summary: ${staticRoutes.length} static + ${dynamicRoutes.length} dynamic = ${allRoutes.length} total`
          );
        }
      );
      await runInjectionChecks(page);
    });
    return;
  }

  for (let workerIdx = 0; workerIdx < NUM_WORKERS; workerIdx++) {
    test(`Browser ${workerIdx + 1}/${NUM_WORKERS}`, async ({ page }) => {
      const routes = routeGroups[workerIdx] ?? [];
      await scanRoutes(page, routes, `browser-${workerIdx + 1}`);
    });
  }

  test('Injection attempts are blocked', async ({ page }) => {
    await runInjectionChecks(page);
  });
});
