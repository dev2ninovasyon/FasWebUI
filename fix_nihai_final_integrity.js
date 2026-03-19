const fs = require('fs');

const nihaiPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\NihaiMenuler.json';
let data = JSON.parse(fs.readFileSync(nihaiPath, 'utf8'));

console.log(`Toplam kayıt sayısı: ${data.length}`);

// 1. Id Yeniden Numaralandırma ve ParentId Haritalama
// Mevcut hiyerarşiyi bozmadan yeni ID'ler atayalım
const oldToNew = new Map();
data.forEach((item, idx) => {
    const newId = idx + 1;
    oldToNew.set(item.Id, newId);
    item.Id = newId;
});

// ParentId'leri yeni Id'lere göre güncelle
data.forEach(item => {
    if (item.ParentId !== null && item.ParentId !== undefined) {
        const mapped = oldToNew.get(item.ParentId);
        if (mapped !== undefined) {
            item.ParentId = mapped;
        } else {
            console.warn(`Uyarı: Id=${item.Id} (${item.BelgeAdi}) için ParentId=${item.ParentId} bulunamadı!`);
            item.ParentId = null;
        }
    }
});

// 2. ReferansNo Standardizasyonu
// Mantık: X.YY.ZZ.WW formatındaki DosyaNevi değerlerini -XXYYZZ-WW formatına çevir
function generateReferansNo(dosyaNevi) {
    if (!dosyaNevi) return null;
    
    // Temizle (örneğin sonunda nokta varsa kaldır: "CD-01." -> "CD-01")
    let clean = dosyaNevi.replace(/\.$/, '');
    
    // Eğer CD-01 or SD-01 gibi bir format ise ReferansNo null olmalı
    if (/^[A-Z]{2}-[0-9]{2}$/.test(clean)) {
        return null;
    }
    
    // Eğer X.YY.ZZ.WW formatında ise
    const parts = clean.split('.');
    if (parts.length >= 2) {
        // İlk parçayı 2 haneli yap (1 -> 01)
        let x = parts[0].padStart(2, '0');
        let yy = (parts[1] || '00').padStart(2, '0');
        let zz = (parts[2] || '00').padStart(2, '0');
        let ww = (parts[3] || '').padStart(2, '0');
        
        if (parts.length === 4) {
            return `-${x}${yy}${zz}-${parts[3].padStart(2, '0')}`;
        } else if (parts.length === 3) {
            return `-${x}${yy}${zz}`;
        } else if (parts.length === 2) {
            return `-${x}${yy}00`;
        }
    }
    
    return null;
}

data.forEach(item => {
    if (item.BelgeAdi === "Anasayfa") {
        item.DosyaNevi = null;
        item.ReferansNo = null;
        return;
    }
    
    // ReferansNo'yu DosyaNevi'den üret
    const newRef = generateReferansNo(item.DosyaNevi);
    item.ReferansNo = newRef;
});

// 3. Sira Numarası Standardizasyonu
const grouped = {};
data.forEach(item => {
    const key = item.ParentId === null || item.ParentId === undefined ? '__root' : String(item.ParentId);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
});

Object.values(grouped).forEach(grp => {
    grp.sort((a, b) => a.Sira - b.Sira || a.Id - b.Id); // Mevcut sırayı koru veya Id'ye göre sırala
    grp.forEach((item, i) => {
        item.Sira = i + 1;
    });
});

// 4. Kaydet
fs.writeFileSync(nihaiPath, JSON.stringify(data, null, 2), 'utf8');

console.log('\n--- SONUÇ ÖZETİ ---');
console.log(`Yeni Id Aralığı: 1 - ${data.length}`);

const roots = data.filter(r => r.ParentId === null);
console.log(`Kök Menü Sayısı: ${roots.length}`);

roots.forEach(r => {
    const ch = data.filter(c => c.ParentId === r.Id);
    console.log(`  ${r.Id}. ${r.BelgeAdi} [${r.DosyaNevi || 'ROOT'}] -> ${ch.length} çocuk`);
});

// Örnek bir hiyerarşik referans no gösterimi
const sample = data.find(i => i.DosyaNevi && i.DosyaNevi.split('.').length === 4);
if (sample) {
    console.log(`\nReferansNo Örneği: ${sample.BelgeAdi}`);
    console.log(`  DosyaNevi: ${sample.DosyaNevi} -> ReferansNo: ${sample.ReferansNo}`);
}
