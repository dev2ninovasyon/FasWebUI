const fs = require('fs');

const nihaiPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\NihaiMenuler.json';
const denetimPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\DenetimDosyaBelgeleri.json';

let nihaiData = JSON.parse(fs.readFileSync(nihaiPath, 'utf8'));
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

// 1. Sürekli Dosya verilerini çek
const sdRoot = denetimData.find(r => r.BelgeAdi === 'SÜREKLİ DOSYA');
const sdChildren = denetimData.filter(r => r.ParentId === sdRoot.Id);

// 2. Sürekli Dosya'yı NihaiMenuler'e ekle (Müşteri Belgeleri'nden hemen sonra, Sira 4)
const mbIdx = nihaiData.findIndex(i => i.BelgeAdi === "Müşteri Belgeleri" && i.ParentId === null);

// Sürekli Dosya Root'u hazırla
const newSDRoot = {
    "Id": 17000, // Geçici
    "DosyaNevi": "SD-01.",
    "BelgeAdi": turkishToTitleCase(sdRoot.BelgeAdi),
    "ReferansNo": null,
    "FormKodu": "",
    "Icon": "IconFolderUp",
    "ParentId": null,
    "FormUrl": "/SurekliDosya",
    "ArsivKlasorAdi": "SD-01",
    "Bobimi": 1,
    "Tfrsmi": 1,
    "ArsivAdi": "Sürekli Dosya",
    "Sira": 4
};

// Sürekli Dosya Çocukları hazırla
const newSDChildren = sdChildren.map((c, idx) => ({
    "Id": 17001 + idx, // Geçici
    "DosyaNevi": c.DosyaNevi,
    "BelgeAdi": turkishToTitleCase(c.BelgeAdi),
    "ReferansNo": c.ReferansNo,
    "FormKodu": c.FormKodu || "",
    "Icon": "IconPoint",
    "ParentId": newSDRoot.Id,
    "FormUrl": c.FormUrl || "#",
    "ArsivKlasorAdi": "SD-01",
    "Bobimi": c.Bobimi ?? 1,
    "Tfrsmi": c.Tfrsmi ?? 1,
    "ArsivAdi": null,
    "Sira": idx + 1
}));

// Ekle
nihaiData.splice(mbIdx + 1, 0, newSDRoot, ...newSDChildren);

// 3. Tüm Id'leri baştan sırala (1-N)
const oldToNew = new Map();
nihaiData.forEach((item, idx) => {
    oldToNew.set(item.Id, idx + 1);
    item.Id = idx + 1;
});

// ParentId'leri güncelle
nihaiData.forEach(item => {
    if (item.ParentId !== null && item.ParentId !== undefined) {
        const mapped = oldToNew.get(item.ParentId);
        if (mapped !== undefined) item.ParentId = mapped;
    }
});

// 4. ReferansNo Standardizasyonu (-XXYYZZ-WW formatı)
// DosyaNevi "X.YY.ZZ.WW" ise ReferansNo "-XXYYZZ-WW" olacak
nihaiData.forEach(item => {
    if (item.BelgeAdi === "Anasayfa") return;
    
    if (item.DosyaNevi && /^[0-9.]+$/.test(item.DosyaNevi.replace(/\.$/, ''))) {
        const parts = item.DosyaNevi.split('.').filter(p => p.length > 0);
        if (parts.length >= 2) {
            // "1.01.00.01" -> "-010100-01"
            let ref = "-";
            parts.forEach((p, idx) => {
                let s = p.padStart(2, '0');
                if (idx === parts.length - 1 && parts.length > 1) {
                    ref += "-" + s;
                } else {
                    ref += s;
                }
            });
            item.ReferansNo = ref;
        }
    }
});

// 5. Her grup için Sira'ları 1'den düzenle
const grouped = {};
nihaiData.forEach(item => {
    const key = item.ParentId === null ? '__root' : String(item.ParentId);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
});
Object.values(grouped).forEach(grp => grp.forEach((item, i) => { item.Sira = i + 1; }));

// 6. Kaydet
fs.writeFileSync(nihaiPath, JSON.stringify(nihaiData, null, 2), 'utf8');
console.log(`Tamamlandı. Sürekli Dosya eklendi ve tüm ReferansNo'lar standardize edildi.`);
