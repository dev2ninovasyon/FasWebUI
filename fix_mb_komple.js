const fs = require('fs');

const nihaiPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\NihaiMenuler.json';
const denetimPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\DenetimDosyaBelgeleri.json';

let data = JSON.parse(fs.readFileSync(nihaiPath, 'utf8'));
const denetimData = JSON.parse(fs.readFileSync(denetimPath, 'utf8'));

function turkishToTitleCase(str) {
    if (!str) return "";
    str = str.normalize('NFC');
    return str.split(' ').map(function(word) {
        if (word === "") return "";
        let lower = word.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
        let firstChar = lower.charAt(0);
        if (firstChar === 'i') firstChar = 'İ';
        else if (firstChar === 'ı') firstChar = 'I';
        else firstChar = firstChar.toUpperCase();
        return (firstChar + lower.slice(1));
    }).join(' ');
}

// 1. Müşteri Belgeleri kök kaydını bul (ParentId=null duruma getirilmiş)
const mb = data.find(r => r.BelgeAdi === 'Müşteri Belgeleri' && r.ParentId === null);
if (!mb) { console.error('Müşteri Belgeleri kök bulunamadı!'); process.exit(1); }
console.log(`Müşteri Belgeleri (kök): Id=${mb.Id}`);

// 2. Mevcut çocukları temizle (varsa)
const existingChildren = data.filter(r => r.ParentId === mb.Id);
if (existingChildren.length > 0) {
    data = data.filter(r => r.ParentId !== mb.Id);
    console.log(`${existingChildren.length} mevcut çocuk temizlendi.`);
}

// 3. DenetimDosyaBelgeleri'nden çocukları al (ParentId=31)
const srcChildren = denetimData.filter(r => r.ParentId === 31);
console.log(`DenetimDosyaBelgeleri'nden ${srcChildren.length} çocuk alındı.`);

// 4. Çocukları oluştur (ParentId = mb.Id)
const newChildren = srcChildren.map((item, idx) => ({
    "Id": 99000 + idx, // geçici Id - sonra yeniden numaralandırılacak
    "DosyaNevi": item.DosyaNevi || "",
    "BelgeAdi": turkishToTitleCase(item.BelgeAdi || ""),
    "ReferansNo": item.ReferansNo || null,
    "FormKodu": item.FormKodu || "",
    "Icon": item.Icon || "IconPoint",
    "ParentId": mb.Id,
    "FormUrl": item.FormUrl || "#",
    "ArsivKlasorAdi": item.ArsivKlasorAdi || "",
    "Bobimi": item.Bobimi !== undefined ? item.Bobimi : 1,
    "Tfrsmi": item.Tfrsmi !== undefined ? item.Tfrsmi : 1,
    "ArsivAdi": null,
    "Sira": idx + 1
}));

// 5. Müşteri Belgeleri'nin indexini bul ve çocukları sonrasına ekle
const mbIdx = data.findIndex(r => r.Id === mb.Id);
data.splice(mbIdx + 1, 0, ...newChildren);

// 6. Tüm Id'leri baştan 1'den başlayarak yeniden sırala
const oldToNew = new Map();
data.forEach((r, idx) => {
    oldToNew.set(r.Id, idx + 1);
    r.Id = idx + 1;
});

// 7. ParentId'leri güncelle
data.forEach(r => {
    if (r.ParentId !== null && r.ParentId !== undefined) {
        const mapped = oldToNew.get(r.ParentId);
        if (mapped !== undefined) r.ParentId = mapped;
        else { console.warn(`ParentId eşleşmesi yok: ${r.BelgeAdi}, ParentId=${r.ParentId}`); r.ParentId = null; }
    }
});

// 8. Sira'ları her parent grubu için 1'den tekrar düzenle
const grouped = {};
data.forEach(r => {
    const key = r.ParentId === null || r.ParentId === undefined ? '__root' : String(r.ParentId);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
});
Object.values(grouped).forEach(grp => grp.forEach((r, i) => { r.Sira = i + 1; }));

// 9. Kaydet
fs.writeFileSync(nihaiPath, JSON.stringify(data, null, 2), 'utf8');

// 10. Özet
console.log(`\nTamamlandı! Toplam ${data.length} kayıt.`);
const rootItems = data.filter(r => r.ParentId === null);
console.log('\n--- KÖK MENÜLER ---');
rootItems.forEach(r => {
    const ch = data.filter(c => c.ParentId === r.Id);
    console.log(`${r.Id}. ${r.BelgeAdi} (${r.FormUrl}) | Sira:${r.Sira} → ${ch.length} çocuk`);
});
const mbFinal = data.find(r => r.BelgeAdi === 'Müşteri Belgeleri' && r.ParentId === null);
if (mbFinal) {
    const ch = data.filter(r => r.ParentId === mbFinal.Id);
    console.log(`\n--- MÜŞTERİ BELGELERİ ÇOCUKLARI (${ch.length}) ---`);
    ch.forEach(r => console.log(`  ${r.Id}. ${r.BelgeAdi} | Sira:${r.Sira}`));
}
