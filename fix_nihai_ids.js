const fs = require('fs');

const nihaiPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\NihaiMenuler.json';
let data = JSON.parse(fs.readFileSync(nihaiPath, 'utf8'));

console.log(`Toplam kayıt: ${data.length}`);

// 1. Mevcut sorunları tespit et
const idCounts = {};
data.forEach(r => { idCounts[r.Id] = (idCounts[r.Id] || 0) + 1; });
const duplicates = Object.entries(idCounts).filter(([k,v]) => v > 1);
if (duplicates.length) console.log('Yinelenmiş Id\'ler:', duplicates.map(([k]) => k).join(', '));

// 2. Geçici bir klon ile çalış: mevcut pozisyona göre yeni Id ata
// Orijinal Id -> Index tablosu
const origIdToIdx = new Map();
data.forEach((r, idx) => {
    if (!origIdToIdx.has(r.Id)) {
        origIdToIdx.set(r.Id, idx);
    }
});

// 3. Her kayıt için dosyadaki sıraya göre yeni Id = idx + 1
const newData = data.map((r, idx) => ({...r, _newId: idx + 1, _oldId: r.Id}));

// 4. oldId -> newId haritası oluştur (ilk karşılana göre)
const oldToNew = new Map();
newData.forEach(r => {
    if (!oldToNew.has(r._oldId)) {
        oldToNew.set(r._oldId, r._newId);
    }
});

// 5. Her kaydı güncelle
newData.forEach(r => {
    r.Id = r._newId;
    if (r.ParentId !== null && r.ParentId !== undefined) {
        const mapped = oldToNew.get(r.ParentId);
        if (mapped !== undefined) {
            r.ParentId = mapped;
        } else {
            // ParentId referansı bulunamadı - null yap
            console.warn(`ParentId=${r.ParentId} (kayıt: ${r.BelgeAdi}) için eşleşme bulunamadı, null yapılıyor.`);
            r.ParentId = null;
        }
    }
    delete r._newId;
    delete r._oldId;
});

// 6. Her parent grubu için Sira'yı 1'den başlayarak düzenle
const grouped = {};
newData.forEach(r => {
    const key = r.ParentId === null || r.ParentId === undefined ? '__root' : String(r.ParentId);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
});
Object.values(grouped).forEach(grp => grp.forEach((r, i) => { r.Sira = i + 1; }));

// 7. Kaydet
fs.writeFileSync(nihaiPath, JSON.stringify(newData, null, 2), 'utf8');
console.log(`\nDüzeltme tamamlandı! Toplam ${newData.length} kayıt.`);

// 8. Doğrulama raporu
console.log('\n--- ÖZET RAPOR ---');
const rootItems = newData.filter(r => r.ParentId === null);
console.log(`Kök menü öğeleri (ParentId=null): ${rootItems.length}`);
rootItems.forEach(r => {
    const children = newData.filter(c => c.ParentId === r.Id);
    if (children.length > 0) console.log(`  ${r.Id}. ${r.BelgeAdi} → ${children.length} çocuk (Son Id: ${children[children.length-1].Id}, Son Sira: ${children[children.length-1].Sira})`);
    else console.log(`  ${r.Id}. ${r.BelgeAdi} → çocuk yok`);
});
