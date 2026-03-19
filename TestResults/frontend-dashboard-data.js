window.__dashboardData = {
    "runAllCommand":  "",
    "generatedAt":  "2026-03-11 17:44:18",
    "totals":  {

               },
    "suites":  [
                   {
                       "id":  "frontend-lint",
                       "description":  "Next.js projesinin kod kalitesi taramasi.",
                       "status":  "skipped",
                       "runCommand":  "npm run lint \u0026\u0026 tsc --noEmit",
                       "title":  "ESLint \u0026 TypeScript Check",
                       "group":  "Static Analysis"
                   },
                   {
                       "id":  "frontend-k6",
                       "description":  "Next.js SSR/Static render ve asset yuklenme performansi.",
                       "status":  "skipped",
                       "runCommand":  "k6 run .\\tests\\performance\\ui-load-test.js",
                       "reportPath":  "TestResults/FasWebUI_Performance/ui-k6/index.html",
                       "title":  "UI Load Test (K6)",
                       "group":  "Performance"
                   },
                   {
                       "id":  "frontend-playwright",
                       "description":  "Gercek tarayici uzerinde uctan uca kullanici testleri.",
                       "status":  "skipped",
                       "runCommand":  "npx playwright test --reporter=html",
                       "reportPath":  "TestResults/playwright-report/index.html",
                       "title":  "Playwright E2E",
                       "group":  "E2E UI Tests"
                   }
               ]
};
