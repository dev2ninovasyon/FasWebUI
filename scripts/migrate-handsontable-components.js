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

    // 1. Update CSS import
    if (content.includes('handsontable/dist/handsontable.full.min.css')) {
      content = content.replace(
        /import ['"]handsontable\/dist\/handsontable\.full\.min\.css['"];/g,
        "import 'handsontable/styles/handsontable.css';\nimport 'handsontable/styles/ht-theme-classic.css';"
      );
      modified = true;
    }

    // 2. Add theme="classic" to HotTable
    if (content.includes('<HotTable') && !content.includes('theme="classic"')) {
      // Find <HotTable and add theme="classic" as a prop
      content = content.replace(/<HotTable/g, '<HotTable theme="classic"');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
});
