const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'src/app/(Uygulama)/PlanVeProgram/DenetimTakvimi/page.tsx');
const templateContent = fs.readFileSync(templatePath, 'utf8');

const extractChildrenSection = (content) => {
    const startMarker = '<Breadcrumb';
    const endMarker = '</Breadcrumb>';
    const start = content.indexOf(startMarker);
    const end = content.indexOf(endMarker, start);
    if (start === -1 || end === -1) return null;
    const openFragment = content.indexOf('<>', start);
    const closeFragment = content.lastIndexOf('</>', end);
    if (openFragment === -1 || closeFragment === -1) return null;
    return content.substring(openFragment + 2, closeFragment).trim();
};

// Kys and remaining files
const filesToUpdate = [
    'src/app/(Uygulama)/Kys/1/UstYonetimVeLiderlikYapisi/page.tsx',
    'src/app/(Uygulama)/Kys/1/RiskDegerlendirmeSureci/RiskBelirleme/page.tsx',
    'src/app/(Uygulama)/Kys/1/RiskDegerlendirmeSureci/RiskeKarsilikVerme/page.tsx',
    'src/app/(Uygulama)/Kys/1/MusteriIliskileriVeSozlesmeKabulu/page.tsx',
    'src/app/(Uygulama)/Kys/1/DenetiminYurutulmesi/page.tsx',
    'src/app/(Uygulama)/Kys/1/Kaynaklar/HizmetSaglayicilar/page.tsx',
    'src/app/(Uygulama)/Kys/1/EtikHukumler/page.tsx',
    'src/app/(Uygulama)/Kys/1/IzlemeVeDuzeltme/page.tsx',
    'src/app/(Uygulama)/Kys/1/Kaynaklar/InsanKaynaklari/page.tsx',
    'src/app/(Uygulama)/Kys/1/BilgiVeIletisim/page.tsx',
];

const responsiveSection = extractChildrenSection(templateContent);
if (!responsiveSection) {
    console.error('Failed to extract');
    process.exit(1);
}

console.log(`Processing ${filesToUpdate.length} KYS files...`);
let successCount = 0;

filesToUpdate.forEach(relPath => {
    const filePath = path.join(__dirname, relPath);
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`✗ Not found: ${relPath}`);
            return;
        }
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('{isMobile ?')) {
            console.log(`- Already updated: ${relPath.split('/').pop()}`);
            return;
        }
        const start = content.indexOf('<Breadcrumb');
        const end = content.indexOf('</Breadcrumb>', start);
        if (start === -1 || end === -1) return;
        const openFragment = content.indexOf('<>', start);
        const closeFragment = content.lastIndexOf('</>', end);
        if (openFragment === -1 || closeFragment === -1) return;
        const before = content.substring(0, openFragment + 2);
        const after = content.substring(closeFragment);
        const newContent = before + '\n' + responsiveSection + '\n        ' + after;
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✓ ${relPath.split('/').pop()}`);
        successCount++;
    } catch (error) {
        console.error(`✗ Error: ${relPath.split('/').pop()}`);
    }
});

console.log(`\nKYS batch complete! Updated: ${successCount} files`);
