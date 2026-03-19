const fs = require('fs');

const nihaiPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\NihaiMenuler.json';
const denetimPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\DenetimDosyaBelgeleri.json';

let nihaiMenuler = JSON.parse(fs.readFileSync(nihaiPath, 'utf8'));
const denetimData = JSON.parse(fs.readFileSync(denetimPath, 'utf8'));

// 1. DenetimDosyaBelgeleri'nden Müşteri Belgeleri çocuklarını al (ParentId=31)
const musteriBelgeleriChildren = denetimData.filter(item => item.ParentId === 31);
console.log(`DenetimDosyaBelgeleri'nden ${musteriBelgeleriChildren.length} çocuk bulundu.`);

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

// 2. Mevcut Müşteri Belgeleri girdisini bul
const mbIdx = nihaiMenuler.findIndex(i => i.FormUrl === '/MusteriBelgeleri' || i.BelgeAdi === 'Müşteri Belgeleri');
if (mbIdx === -1) { console.error('Müşteri Belgeleri bulunamadı!'); process.exit(1); }
const mbId = nihaiMenuler[mbIdx].Id;
console.log(`Müşteri Belgeleri: Id=${mbId}, Index=${mbIdx}`);

// 3. Mevcut çocukları kaldır (varsa)
const existingChildSet = new Set(nihaiMenuler.filter(i => i.ParentId === mbId).map(i => i.Id));
if (existingChildSet.size > 0) {
    function collectAll(ids) {
        const children = nihaiMenuler.filter(i => ids.has(i.ParentId));
        if (children.length === 0) return ids;
        children.forEach(c => ids.add(c.Id));
        return collectAll(ids);
    }
    const toRemove = collectAll(new Set(existingChildSet));
    nihaiMenuler = nihaiMenuler.filter(i => !toRemove.has(i.Id));
    console.log(`${toRemove.size} eski çocuk kaldırıldı.`);
}

// 4. Müşteri Belgeleri'nin yeni indexini bul
const mbNewIdx = nihaiMenuler.findIndex(i => i.Id === mbId);

// 5. Yeni çocuk kayıtlarını oluştur (ParentId = mbId olarak)
const childRows = musteriBelgeleriChildren.map((item, idx) => ({
    "Id": 0, // sonra atanacak
    "DosyaNevi": item.DosyaNevi || "",
    "BelgeAdi": turkishToTitleCase(item.BelgeAdi || ""),
    "ReferansNo": item.ReferansNo || null,
    "FormKodu": item.FormKodu || "",
    "Icon": item.Icon || "IconPoint",
    "ParentId": mbId, // MBId olarak direkt set ediyoruz
    "FormUrl": item.FormUrl || "#",
    "ArsivKlasorAdi": item.ArsivKlasorAdi || "",
    "Bobimi": item.Bobimi !== undefined ? item.Bobimi : 1,
    "Tfrsmi": item.Tfrsmi !== undefined ? item.Tfrsmi : 1,
    "ArsivAdi": null,
    "Sira": idx + 1
}));

// 6. Çocukları listeyeye ekle
nihaiMenuler.splice(mbNewIdx + 1, 0, ...childRows);

// 7. Tüm Id'leri yeniden sırala, ParentId haritasını güncelle
// Önce eski Id → new Id haritası oluştur
const oldIds = nihaiMenuler.map(r => r.Id);
const oldToNew = new Map();
nihaiMenuler.forEach((r, idx) => {
    if (r.Id !== 0 && r.Id !== undefined) {
        oldToNew.set(r.Id, idx + 1);
    }
});

// Yeni Id'leri ata
nihaiMenuler.forEach((r, idx) => { r.Id = idx + 1; });

// ParentId'leri güncelle (0 olmayanlar için haritadan bak)
nihaiMenuler.forEach(r => {
    if (r.ParentId !== null && r.ParentId !== undefined) {
        const mapped = oldToNew.get(r.ParentId);
        if (mapped !== undefined) r.ParentId = mapped;
    }
});

// 8. Her seviyede Sira'yı yeniden düzenle
const grouped = {};
nihaiMenuler.forEach(item => {
    const key = item.ParentId === null || item.ParentId === undefined ? '__root' : String(item.ParentId);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
});
Object.values(grouped).forEach(grp => grp.forEach((item, i) => { item.Sira = i + 1; }));

// 9. Kaydet
fs.writeFileSync(nihaiPath, JSON.stringify(nihaiMenuler, null, 2), 'utf8');
console.log(`\nTamamlandı! Toplam ${nihaiMenuler.length} kayıt.`);

// Doğrulama
const mb2 = nihaiMenuler.find(i => i.FormUrl === '/MusteriBelgeleri' || i.BelgeAdi === 'Müşteri Belgeleri');
if (mb2) {
    const ch = nihaiMenuler.filter(i => i.ParentId === mb2.Id);
    console.log(`Müşteri Belgeleri (Id:${mb2.Id}) altında ${ch.length} çocuk.`);
    ch.forEach(c => console.log(`  ${c.Id} | ${c.BelgeAdi} | Sira:${c.Sira}`));
}
