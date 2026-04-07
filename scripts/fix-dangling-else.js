const fs = require('fs');
const path = require('path');

const files = [
    'src/app/(Uygulama)/components/Donusum/FisGirisi/FisGirisiKontrol.tsx',
    'src/app/(Uygulama)/Hesaplamalar/ErtelenmisVergiHesabi/VergiVarlik.tsx',
    'src/app/(Uygulama)/Hesaplamalar/ErtelenmisVergiHesabi/VergiYukumluluk.tsx',
    'src/app/(Uygulama)/Veri/EDefterInceleme/FisDetaylari/[id]/FisDetaylari.tsx'
].map(f => path.join(process.cwd(), f));

files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Replace dangling else followed by end of function, or anything similar.
        // E.g. "} else \n  };" or "} else \r\n  };"
        let modified = content.replace(/\}\s*else\s*[\r\n]+\s*\};/g, '}\n  };');
        
        if (content !== modified) {
            fs.writeFileSync(filePath, modified, 'utf8');
            console.log(`Fixed dangling else in: ${filePath}`);
        } else {
            console.log(`Pattern not found in: ${filePath}, trying a more general replace`);
            // Attempt another pattern just in case:
            modified = content.replace(/\}\s*else\s*$/gm, '}');
            if(content !== modified) {
                fs.writeFileSync(filePath, modified, 'utf8');
                console.log(`Fixed dangling else (fallback match) in: ${filePath}`);
            } else {
                console.log(`Still not found in: ${filePath}`);
            }
        }
    } else {
        console.log(`File not found: ${filePath}`);
    }
});
