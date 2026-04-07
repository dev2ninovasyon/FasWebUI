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

    // Remove the custom stripe logic from afterRenderer
    // Look for row % 2 patterns which are used for custom stripes
    if (content.includes('row % 2 === 0')) {
      // Regex to find and remove the whole if-else block for striped rows
      // and custom color assignments that override the theme.
      const stripeRegex = /if\s*\(row\s*%\s*2\s*===\s*0\)\s*\{[\s\S]*?\}\s*else\s*\{[\s\S]*?\}/g;
      if (stripeRegex.test(content)) {
          content = content.replace(stripeRegex, '');
          modified = true;
      }
      
      // Also remove custom TD.style.color and border manual overrides
      content = content.replace(/TD\.style\.color\s*=\s*customizer\.activeMode\s*===\s*["']dark["']\s*\?\s*["']#ffffff["']\s*:\s*["']#2A3547["'];/g, '');
      content = content.replace(/TD\.style\.borderColor\s*=[\s\S]*?;/g, '');
      content = content.replace(/TD\.style\.borderRightColor\s*=[\s\S]*?;/g, '');
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned Renderer: ${filePath}`);
    }
  }
});
