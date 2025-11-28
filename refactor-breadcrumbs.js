const fs = require('fs');
const path = require('path');

// Find all page.tsx files
function findPageFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findPageFiles(filePath, fileList);
        } else if (file === 'page.tsx' && !filePath.includes('Layout')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Refactor a single page file
function refactorPage(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Skip if already using useBreadcrumb
        if (content.includes('useBreadcrumb')) {
            return { status: 'skipped', message: 'Already refactored' };
        }

        // Skip if no BCrumb definition
        if (!content.includes('const BCrumb = [')) {
            return { status: 'skipped', message: 'No BCrumb found' };
        }

        // Step 1: Add useBreadcrumb import after the last import
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
            const afterImport = content.indexOf('\n', lastImportIndex) + 1;
            const beforeContent = content.substring(0, afterImport);
            const afterContent = content.substring(afterImport);
            content = beforeContent + 'import { useBreadcrumb } from "@/hooks/useBreadcrumb";\n' + afterContent;
        }

        // Step 2: Remove BCrumb definition
        const bcrumbMatch = content.match(/const BCrumb = \[\s*\{[\s\S]*?\}\s*\];?\s*\n*/);
        if (bcrumbMatch) {
            content = content.replace(bcrumbMatch[0], '');
        }

        // Step 3: Add useBreadcrumb hook call at component start
        content = content.replace(
            /(const Page = \(\) => \{)\s*\n/,
            '$1\n  const { items: BCrumb, currentTitle } = useBreadcrumb();\n\n'
        );

        // Step 4: Replace hardcoded title in Breadcrumb component
        content = content.replace(
            /<Breadcrumb\s+title="([^"]+)"\s+items=\{BCrumb\}/g,
            '<Breadcrumb title={currentTitle} items={BCrumb}'
        );

        // Write back
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
        return { status: 'success' };

    } catch (error) {
        console.error(`❌ ${path.relative(process.cwd(), filePath)}: ${error.message}`);
        return { status: 'error', message: error.message };
    }
}

// Main execution
const pagesDir = path.join(__dirname, 'src', 'app', '(Uygulama)');
const pageFiles = findPageFiles(pagesDir);

console.log(`📁 Found ${pageFiles.length} page files\n`);

const results = { success: 0, skipped: 0, error: 0 };

pageFiles.forEach(file => {
    const result = refactorPage(file);
    results[result.status]++;
});

console.log(`\n📊 Summary: ✅ ${results.success} | ⏭️ ${results.skipped} | ❌ ${results.error}`);
