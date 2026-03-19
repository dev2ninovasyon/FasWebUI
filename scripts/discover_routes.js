const fs = require('fs');
const path = require('path');

const appDir = path.join(process.cwd(), 'src', 'app');

function getRoutes(dir, baseRoute = '') {
    let routes = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Next.js (Folder) groups don't add to the URL
            let nextRoute = file.startsWith('(') && file.endsWith(')') ? baseRoute : path.join(baseRoute, file);
            routes = routes.concat(getRoutes(fullPath, nextRoute));
        } else if (file === 'page.tsx' || file === 'page.js') {
            routes.push(baseRoute.replace(/\\/g, '/') || '/');
        }
    }
    return routes;
}

try {
    const allRoutes = getRoutes(appDir);
    const uniqueRoutes = [...new Set(allRoutes)]
        .filter(r => !r.includes('[') && r !== 'login' && r !== 'forbidden' && r !== 'maintenance')
        .map(r => r === '' ? '/' : (r.startsWith('/') ? r : '/' + r));
    
    const outputPath = path.join(process.cwd(), 'tests', 'security', 'routes.json');
    fs.writeFileSync(outputPath, JSON.stringify(uniqueRoutes, null, 2));
    console.log(`✅ ${uniqueRoutes.length} route saved to ${outputPath}`);
} catch (e) {
    console.error(e.message);
}
