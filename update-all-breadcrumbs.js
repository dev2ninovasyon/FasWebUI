const fs = require('fs');
const path = require('path');

// Read the template file that has the correct responsive pattern
const templatePath = path.join(__dirname, 'src/app/(Uygulama)/PlanVeProgram/DenetimTakvimi/page.tsx');
const templateContent = fs.readFileSync(templatePath, 'utf8');

// Extract the children section from template
const extractChildrenSection = (content) => {
    const startMarker = '<Breadcrumb';
    const endMarker = '</Breadcrumb>';

    const start = content.indexOf(startMarker);
    const end = content.indexOf(endMarker, start);

    if (start === -1 || end === -1) return null;

    // Find the opening <> after <Breadcrumb...>
    const openFragment = content.indexOf('<>', start);
    // Find the closing </> before </Breadcrumb>
    const closeFragment = content.lastIndexOf('</>', end);

    if (openFragment === -1 || closeFragment === -1) return null;

    return content.substring(openFragment + 2, closeFragment).trim();
};

// Files to update
const filesToUpdate = [
    'src/app/(Uygulama)/PlanVeProgram/DenetlenenIsletmeninTabiOlduguMevzuataIliskinDegerlendirme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/MaddiDogrulukGorevAtamalari/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/MeslekiDeneyimYeterlilik/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/MeslekiEtik/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/BulguRiskiBelirleme/page.tsx',
    'src/app/(Uygulama)/Surdurulebilirlik/SurdurulebilirlikGenelBilgiler/page.tsx',
    'src/app/(Uygulama)/Surdurulebilirlik/SurdurulebilirlikCevreselEtkiler/page.tsx',
    'src/app/(Uygulama)/Surdurulebilirlik/SurdurulebilirlikKurumsalYonetisim/page.tsx',
    'src/app/(Uygulama)/Surdurulebilirlik/SurdurulebilirlikSosyalSorumluluk/page.tsx',
    'src/app/(Uygulama)/Surdurulebilirlik/SurdurulebilirlikEkBilgiler/page.tsx',
    'src/app/(Uygulama)/Musteri/TeklifBelgesi/page.tsx',
    'src/app/(Uygulama)/Musteri/SozlesmeKabul/page.tsx',
    'src/app/(Uygulama)/Musteri/MusteriDurustlugunuDegerlendirme/page.tsx',
    'src/app/(Uygulama)/Musteri/IsletmeTanima/page.tsx',
    'src/app/(Uygulama)/Musteri/KendiYetkinliginiDegerlendirme/page.tsx',
    'src/app/(Uygulama)/Musteri/IsletmeFaaliyetVeCevresiTanima/page.tsx',
];

const responsiveSection = extractChildrenSection(templateContent);

if (!responsiveSection) {
    console.log('Failed to extract responsive section from template');
    process.exit(1);
}

console.log(`Processing ${filesToUpdate.length} files...`);
let successCount = 0;
let errorCount = 0;

filesToUpdate.forEach(relPath => {
    const filePath = path.join(__dirname, relPath);

    try {
        if (!fs.existsSync(filePath)) {
            console.log(`✗ File not found: ${relPath}`);
            errorCount++;
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');

        // Skip if already converted
        if (content.includes('{isMobile ?')) {
            console.log(`- Already converted: ${relPath}`);
            return;
        }

        // Find and replace the children section
        const startMarker = '<Breadcrumb';
        const endMarker = '</Breadcrumb>';

        const start = content.indexOf(startMarker);
        const end = content.indexOf(endMarker, start);

        if (start === -1 || end === -1) {
            console.log(`✗ Could not find Breadcrumb markers in: ${relPath}`);
            errorCount++;
            return;
        }

        const openFragment = content.indexOf('<>', start);
        const closeFragment = content.lastIndexOf('</>', end);

        if (openFragment === -1 || closeFragment === -1) {
            console.log(`✗ Could not find fragment markers in: ${relPath}`);
            errorCount++;
            return;
        }

        // Replace the section
        const before = content.substring(0, openFragment + 2);
        const after = content.substring(closeFragment);
        const newContent = before + '\n' + responsiveSection + '\n        ' + after;

        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✓ Updated: ${relPath}`);
        successCount++;

    } catch (error) {
        console.log(`✗ Error processing ${relPath}:`, error.message);
        errorCount++;
    }
});

console.log(`\nComplete! Successfully updated: ${successCount}, Errors: ${errorCount}`);
