const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDir = isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const srcDir = path.join(process.cwd(), 'src');

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Ensure modern imports
    if (content.includes('handsontable')) {
      if (!content.includes('handsontable/styles/handsontable.css')) {
          // This should have been handled by previous script, but ensuring.
          content = content.replace(/import ['"]handsontable\/dist\/handsontable\.full\.min\.css['"];/g, "import 'handsontable/styles/handsontable.css';\nimport 'handsontable/styles/ht-theme-horizon.css';\nimport 'handsontable/styles/ht-icons-main.css';");
          modified = true;
      }
      if (!content.includes('ht-icons-main.css') && content.includes('handsontable/styles/handsontable.css')) {
          content = content.replace("import 'handsontable/styles/handsontable.css';", "import 'handsontable/styles/handsontable.css';\nimport 'handsontable/styles/ht-icons-main.css';");
          modified = true;
      }
    }

    // 2. Remove afterGetColHeader and afterGetRowHeader from HotTable props IF they point to the identified custom functions
    // We look for the patterns in the HotTable tag.
    if (content.includes('<HotTable')) {
        let originalContent = content;
        
        // Ensure theme="horizon"
        if (content.includes('theme="classic"')) {
            content = content.replace(/theme="classic"/g, 'theme="horizon"');
        } else if (!content.includes('theme="horizon"')) {
            content = content.replace('<HotTable', '<HotTable theme="horizon"');
        }

        // Remove the problematic header props
        content = content.replace(/\s+afterGetColHeader=\{afterGetColHeader\}/g, '');
        content = content.replace(/\s+afterGetRowHeader=\{afterGetRowHeader\}/g, '');
        
        if (content !== originalContent) modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Purified: ${filePath}`);
    }
  }
});
