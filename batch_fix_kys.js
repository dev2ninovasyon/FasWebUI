// Batch fix script for adding responsive breadcrumb imports to Kys files

const fs = require('fs');
const path = require('path');

const filesToFix = [
    'c:\\Users\\lenov\\FasWebUI\\src\\app\\(Uygulama)\\Kys\\1\\IzlemeVeDuzeltme\\page.tsx',
    'c:\\Users\\lenov\\FasWebUI\\src\\app\\(Uygulama)\\Kys\\1\\Kaynaklar\\HizmetSaglayicilar\\page.tsx',
    'c:\\Users\\lenov\\FasWebUI\\src\\app\\(Uygulama)\\Kys\\1\\Kaynaklar\\InsanKaynaklari\\page.tsx',
    'c:\\Users\\lenov\\FasWebUI\\src\\app\\(Uygulama)\\Kys\\1\\MusteriIliskileriVeSozlesmeKabulu\\page.tsx',
    'c:\\Users\\lenov\\FasWebUI\\src\\app\\(Uygulama)\\Kys\\1\\BilgiVeIletisim\\page.tsx',
    'c:\\Users\\lenov\\FasWebUI\\src\\app\\(Uygulama)\\Kys\\1\\Kaynaklar\\page.tsx',
    'c:\\Users\\lenov\\FasWebUI\\src\\app\\(Uygulama)\\Kys\\1\\RiskDegerlendirmeSureci\\page.tsx',
    'c:\\Users\\lenov\\FasWebUI\\src\\app\\(Uygulama)\\Kys\\1\\page.tsx'
];

filesToFix.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if file needs fixing (has isMobile reference but no imports)
    if (!content.includes('isMobile') || content.includes('useMediaQuery')) {
        console.log(`Skipping ${path.basename(path.dirname(filePath))}/${path.basename(filePath)} - already fixed or doesn't need fixing`);
        return;
    }

    // Fix imports
    content = content.replace(
        /import { Box, Button, Grid, Typography } from "@mui\/material";/,
        'import { Box, Button, Grid, Typography, IconButton, Menu, MenuItem, useTheme, useMediaQuery } from "@mui/material";\nimport { IconDotsVertical } from "@tabler/icons-react";'
    );

    // Add state management after "const Page = () => {"
    content = content.replace(
        /const Page = \(\) => {\r?\n/,
        `const Page = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
`
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${path.basename(path.dirname(filePath))}/${path.basename(filePath)}`);
});

console.log('Batch fix completed!');
