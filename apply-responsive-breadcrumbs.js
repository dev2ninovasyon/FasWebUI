// Migration script to apply responsive breadcrumb pattern to all pages
// Usage: node apply-responsive-breadcrumbs.js

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    // PlanVeProgram
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
    'src/app/(Uygulama)/PlanVeProgram/IcKontrolDegerlendirme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/IsletmeyeIliskinIcKontrolTespit/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/IsletmeyeIliskinIcKontrolSistemiOzetDegerlendirme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/IsletmeVarliklarininKorunmasinaIliskinDegerlendirme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/BilgiIslemMuhasebe/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/DenetlenenIsletmeninTabiOlduguMevzuataIliskinDegerlendirme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/MaddiDogrulukGorevAtamalari/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/MeslekiDeneyimYeterlilik/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/MeslekiEtik/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/HileUsulsuzlukEkipCalismasi/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/TespitEdilenRiskler/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/FinansalTablolarDenetimRiskiBelirleme/page.tsx',
    'src/app/(Uygulama)/PlanVeProgram/BulguRiskiBelirleme/page.tsx',

    // Surdurulebilirlik
    'src/app/(Uygulama)/Surdurulebilirlik/SurdurulebilirlikGenelBilgiler/page.tsx',
    'src/app/(Uygulama)/Surdurulebilirlik/SurdurulebilirlikCevreselEtkiler/page.tsx',
    'src/app/(Uygulama)/Surdurulebilirlik/SurdurulebilirlikKurumsalYonetisim/page.tsx',
    'src/app/(Uygulama)/Surdurulebilirlik/SurdurulebilirlikSosyalSorumluluk/page.tsx',
    'src/app/(Uygulama)/Surdurulebilirlik/SurdurulebilirlikEkBilgiler/page.tsx',

    // Musteri
    'src/app/(Uygulama)/Musteri/TeklifBelgesi/page.tsx',
    'src/app/(Uygulama)/Musteri/SozlesmeKabul/page.tsx',
    'src/app/(Uygulama)/Musteri/MusteriDurustlugunuDegerlendirme/page.tsx',
    'src/app/(Uygulama)/Musteri/IsletmeTanima/page.tsx',
    'src/app/(Uygulama)/Musteri/KendiYetkinliginiDegerlendirme/page.tsx',
    'src/app/(Uygulama)/Musteri/IsletmeFaaliyetVeCevresiTanima/page.tsx',

    // DenetimKanitlari
    'src/app/(Uygulama)/DenetimKanitlari/DigerKanitlar/MusteriIsletmePersoneliIleYapilanGorusme/page.tsx',
    'src/app/(Uygulama)/DenetimKanitlari/DigerKanitlar/SatisTahsilatKontrol/page.tsx',
    'src/app/(Uygulama)/DenetimKanitlari/DigerKanitlar/MuhasebeHatalariVeHileKanitlariDegerlendirme/page.tsx',
];

function applyResponsivePattern(fileContent) {
    // Step 1: Add imports if not present
    if (!fileContent.includes('IconButton, Menu, MenuItem')) {
        fileContent = fileContent.replace(
            /import \{ Box, Button, Grid, Typography \} from "@mui\/material";/,
            'import { Box, Button, Grid, Typography, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from "@mui/material";\nimport { IconDotsVertical } from "@tabler/icons-react";'
        );
    }

    // Step 2: Add state management after Page component declaration
    const componentDeclaration = 'const Page = () => {';
    if (fileContent.includes(componentDeclaration) && !fileContent.includes('const isMobile = useMediaQuery')) {
        const stateManagement = `
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
`;
        fileContent = fileContent.replace(componentDeclaration, componentDeclaration + stateManagement);
    }

    // Step 3: Add menu handlers before handleOpen
    if (!fileContent.includes('handleMenuOpen')) {
        const handlersCode = `
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

`;
        fileContent = fileContent.replace(/(\s+const handleOpen = \(\) => {)/, handlersCode + '$1');
    }

    // Step 4: Add handleMenuClose to handleOpen
    if (!fileContent.includes('handleMenuClose();') && fileContent.includes('setIsClickedYeniGrupEkle(true);')) {
        fileContent = fileContent.replace(
            /(setIsClickedYeniGrupEkle\(true\);)/,
            '$1\n    handleMenuClose();'
        );
    }

    return fileContent;
}

console.log(`Processing ${filesToUpdate.length} files...`);
let successCount = 0;
let errorCount = 0;

filesToUpdate.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);

    try {
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const updatedContent = applyResponsivePattern(content);

            if (content !== updatedContent) {
                fs.writeFileSync(fullPath, updatedContent, 'utf8');
                console.log(`✓ Updated: ${filePath}`);
                successCount++;
            } else {
                console.log(`- Skipped (no changes needed): ${filePath}`);
            }
        } else {
            console.log(`✗ File not found: ${filePath}`);
            errorCount++;
        }
    } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
        errorCount++;
    }
});

console.log(`\nComplete! Successfully updated: ${successCount}, Errors: ${errorCount}`);
