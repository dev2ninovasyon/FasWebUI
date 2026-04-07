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

    // 1. Update theme CSS and add icons CSS
    if (content.includes('handsontable/styles/ht-theme-classic.css')) {
      content = content.replace(
        /import ['"]handsontable\/styles\/ht-theme-classic\.css['"];/g,
        "import 'handsontable/styles/ht-theme-horizon.css';\nimport 'handsontable/styles/ht-icons-main.css';"
      );
      modified = true;
    }

    // 2. Update HotTable theme prop
    if (content.includes('theme="classic"')) {
      content = content.replace(/theme="classic"/g, 'theme="horizon"');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated to Horizon: ${filePath}`);
    }
  }
});
