#!/usr/bin/env node
/**
 * Menu-Document Synchronization Analyzer
 * Analyzes matching between Menuiconlist.json and DenetimDosyaBelgeleri.json
 */

const fs = require('fs');
const path = require('path');

class SyncAnalyzer {
  constructor(menuFile, docsFile) {
    this.menuFile = menuFile;
    this.docsFile = docsFile;
    this.menuItems = [];
    this.documents = [];
    this.docNamesLower = {};
    this.docUrls = {};
  }

  loadFiles() {
    console.log('📂 Loading files...');
    
    // Load menu
    const menuData = fs.readFileSync(this.menuFile, 'utf-8');
    const menuJson = JSON.parse(menuData);
    this.menuItems = menuJson.menu || [];
    console.log(`✅ Menu loaded: ${this.menuItems.length} top-level items`);
    
    // Load documents
    const docsData = fs.readFileSync(this.docsFile, 'utf-8');
    this.documents = JSON.parse(docsData);
    console.log(`✅ Documents loaded: ${this.documents.length} records`);
  }

  buildDocumentIndex() {
    console.log('📑 Building document index...');
    
    this.documents.forEach(doc => {
      const docName = doc.BelgeAdi || '';
      const formCode = doc.FormKodu || '';
      const formUrl = doc.FormUrl || '';
      const docId = doc.Id;
      
      // Index by name (lowercase)
      if (docName) {
        const lower = docName.toLowerCase();
        this.docNamesLower[lower] = {
          id: docId,
          name: docName,
          code: formCode,
          url: formUrl,
          original: doc
        };
      }
      
      // Index by URL
      if (formUrl) {
        this.docUrls[formUrl] = {
          id: docId,
          name: docName,
          code: formCode,
          url: formUrl
        };
      }
    });
    
    console.log(`✅ Index built: ${Object.keys(this.docNamesLower).length} names, ${Object.keys(this.docUrls).length} URLs`);
  }

  flattenMenu() {
    const flattened = [];
    
    const traverse = (items, path = '') => {
      items.forEach(item => {
        const name = item.name || '';
        const icon = item.icon || '';
        const fullPath = path ? `${path}/${name}` : name;
        
        flattened.push({
          name,
          icon,
          path: fullPath,
          hasChildren: (item.children && item.children.length > 0) || false
        });
        
        // Recurse
        if (item.children && item.children.length > 0) {
          traverse(item.children, fullPath);
        }
      });
    };
    
    traverse(this.menuItems);
    return flattened;
  }

  findDocumentMatch(menuName) {
    const menuLower = menuName.toLowerCase();
    
    // Exact match attempt
    if (this.docNamesLower[menuLower]) {
      return [true, this.docNamesLower[menuLower]];
    }
    
    // Fuzzy match attempts
    for (const [docNameLower, docInfo] of Object.entries(this.docNamesLower)) {
      // Check containment
      if (menuLower.includes(docNameLower) || docNameLower.includes(menuLower)) {
        if (menuName.length > 4) { // Avoid short name matches
          return [true, docInfo];
        }
      }
    }
    
    return [false, {}];
  }

  analyze() {
    console.log('\n🔍 Starting synchronization analysis...\n');
    
    const flattenedMenu = this.flattenMenu();
    
    const matched = [];
    const unmatchedMenu = [];
    const unmatchedDocIds = new Set();
    const matchedDocIds = new Set();
    
    console.log(`📋 Analyzing ${flattenedMenu.length} menu items...`);
    
    // Analyze menu items
    flattenedMenu.forEach(menuItem => {
      const [found, docInfo] = this.findDocumentMatch(menuItem.name);
      
      if (found) {
        matched.push({
          menuName: menuItem.name,
          menuPath: menuItem.path,
          docId: docInfo.id,
          docName: docInfo.name,
          formCode: docInfo.code,
          formUrl: docInfo.url
        });
        matchedDocIds.add(docInfo.id);
      } else {
        unmatchedMenu.push({
          menuName: menuItem.name,
          menuPath: menuItem.path,
          status: 'MISSING_IN_DOCUMENTS',
          action: 'ADD_TO_DOCUMENTS'
        });
      }
    });
    
    // Find documents not in menu
    this.documents.forEach(doc => {
      if (!matchedDocIds.has(doc.Id)) {
        unmatchedDocIds.add(doc.Id);
      }
    });
    
    console.log(`✅ Matched: ${matched.length} items`);
    console.log(`❌ Unmatched Menu: ${unmatchedMenu.length} items`);
    console.log(`❌ Unmatched Documents: ${unmatchedDocIds.size} items`);
    
    return {
      matched,
      unmatchedMenu,
      unmatchedDocIds: Array.from(unmatchedDocIds),
      summary: {
        totalMenuItems: flattenedMenu.length,
        totalDocuments: this.documents.length,
        matchedCount: matched.length,
        menuGaps: unmatchedMenu.length,
        documentGaps: unmatchedDocIds.size,
        matchPercentage: parseFloat(((matched.length / flattenedMenu.length) * 100).toFixed(1))
      }
    };
  }

  saveResults(results, outputDir = '.') {
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Full report
    fs.writeFileSync(
      path.join(outputDir, 'SYNC_ANALYSIS_FULL.json'),
      JSON.stringify(results, null, 2)
    );
    
    // Matched items only
    fs.writeFileSync(
      path.join(outputDir, 'MATCHED_ITEMS.json'),
      JSON.stringify(results.matched, null, 2)
    );
    
    // Unmatched menu items
    fs.writeFileSync(
      path.join(outputDir, 'MENU_ITEMS_NOT_IN_DOCUMENTS.json'),
      JSON.stringify(results.unmatchedMenu, null, 2)
    );
    
    // Unmatched documents
    const unmatchedDocsData = this.documents.filter(doc => 
      results.unmatchedDocIds.includes(doc.Id)
    );
    fs.writeFileSync(
      path.join(outputDir, 'DOCUMENTS_NOT_IN_MENU.json'),
      JSON.stringify(unmatchedDocsData, null, 2)
    );
    
    // Summary
    const summary = {
      analysisTimestamp: new Date().toISOString(),
      summary: results.summary,
      filesAnalyzed: {
        menu: this.menuFile,
        documents: this.docsFile
      }
    };
    fs.writeFileSync(
      path.join(outputDir, 'SYNC_SUMMARY.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log(`\n📁 Results saved to ${outputDir}/`);
    console.log('   - SYNC_ANALYSIS_FULL.json');
    console.log('   - MATCHED_ITEMS.json');
    console.log('   - MENU_ITEMS_NOT_IN_DOCUMENTS.json');
    console.log('   - DOCUMENTS_NOT_IN_MENU.json');
    console.log('   - SYNC_SUMMARY.json');
  }
}

// Main execution
function main() {
  const menuFile = 'Menuiconlist.json';
  const docsFile = '../FasWebAPI/Data/JsonFiles/DenetimDosyaBelgeleri.json';
  const outputDir = './sync_analysis';
  
  try {
    const analyzer = new SyncAnalyzer(menuFile, docsFile);
    analyzer.loadFiles();
    analyzer.buildDocumentIndex();
    const results = analyzer.analyze();
    analyzer.saveResults(results, outputDir);
    
    // Print summary
    const summary = results.summary;
    console.log(`\n📊 SYNCHRONIZATION SUMMARY`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Total Menu Items: ${summary.totalMenuItems}`);
    console.log(`Total Documents: ${summary.totalDocuments}`);
    console.log(`Matched: ${summary.matchedCount} (${summary.matchPercentage}%)`);
    console.log(`Menu Gaps: ${summary.menuGaps}`);
    console.log(`Document Gaps: ${summary.documentGaps}`);
    console.log(`${'='.repeat(50)}\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
