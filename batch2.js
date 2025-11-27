const fs = require('fs');
const path = require('path');

// Read the template file
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

const filesToUpdate = [
    'src/app/(Uygulama)/PlanVeProgram/DenetimProgrami/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/DenetimPlani/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/DenetimRiskBelirleme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/DenetimRiskDegerlendirme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/DenetimStratejiKilavuzu/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/DenetimZamaniBildirme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/EtikGerekliliklereIliskinBildirim/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/FaaliyetRiskBelirleme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/HesaplaraIliskinIcKontrolTespit/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/HileUsulsuzlukBelirleme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/HileUsulsuzlukDegerlendirme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/IsletmeyeIliskinIcKontrolTespit/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/IsletmeyeIliskinIcKontrolSistemiOzetDegerlendirme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/IsletmeVarliklarininKorunmasinaIliskinDegerlendirme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/BilgiIslemMuhasebe/page.tsx',
];

const responsiveSection = extractChildrenSection(templateContent);
if (!responsiveSection) {
    console.error('Failed to extract responsive section');
    process.exit(1);
}

console.log(`Processing ${filesToUpdate.length} files...`);
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
        console.log(`✓ Updated: ${relPath.split('/').pop()}`);
        successCount++;
    } catch (error) {
        console.error(`✗ Error: ${relPath}`, error.message);
    }
});

console.log(`\nBatch complete! Updated: ${successCount} files`);
