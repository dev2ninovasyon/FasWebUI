const fs = require('fs');

const nihaiPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\NihaiMenuler.json';
const denetimPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\DenetimDosyaBelgeleri.json';

const nihaiData = JSON.parse(fs.readFileSync(nihaiPath, 'utf8'));
const denetimData = JSON.parse(fs.readFileSync(denetimPath, 'utf8'));

function normalize(str) {
    if (!str) return "";
    return str.toLowerCase()
        .replace(/ı/g, 'i').replace(/İ/g, 'i')
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'g')
        .replace(/ü/g, 'u').replace(/Ü/g, 'u')
        .replace(/ş/g, 's').replace(/Ş/g, 's')
        .replace(/ö/g, 'o').replace(/Ö/g, 'o')
        .replace(/ç/g, 'c').replace(/Ç/g, 'c')
        .trim();
}

// 1. Referans Haritası
const refMap = new Map();
denetimData.forEach(item => {
    const key = normalize(item.BelgeAdi);
    if (!refMap.has(key)) refMap.set(key, item);
});

// 2. Kök Menü Eşleşme Kuralları
const rootRules = {
    "müşteri": { dosyaNevi: "CD-01.", klasor: "CD-01", refId: 1 },
    "müşteri belgeleri": { dosyaNevi: "CD-02.", klasor: "CD-02", refId: 31 },
    "hesaplamalar": { dosyaNevi: "CD-03.", klasor: "CD-03", refId: 66 },
    "plan ve program": { dosyaNevi: "CD-04.", klasor: "CD-04", refId: 77 },
    "denetim kanıtları": { dosyaNevi: "CD-05.", klasor: "CD-05", refId: 112 },
    "maddi doğrulama prosedürleri": { dosyaNevi: "CD-06.", klasor: "CD-06", refId: 166 },
    "rapor": { dosyaNevi: "CD-07.", klasor: "CD-07", refId: 217 },
    "genel kurul": { dosyaNevi: "CD-08.", klasor: "CD-08", refId: 220 },
    "diğer işlemler": { dosyaNevi: "CD-19.", klasor: "CD-19", refId: null },
    "enflasyon": { dosyaNevi: "CD-11.", klasor: "CD-11", refId: 672 },
    "sürdürülebilirlik": { dosyaNevi: "CD-12.", klasor: "CD-12", refId: 679 },
    "kys": { dosyaNevi: "CD-13.", klasor: "CD-13", refId: 690 },
    "denetim dosya": { dosyaNevi: "CD-18.", klasor: "CD-18", refId: null }
};

// 3. Güncelleme Fonksiyonu
nihaiData.forEach(item => {
    // Anasayfa özel
    if (item.BelgeAdi === "Anasayfa") {
        item.DosyaNevi = null;
        item.ReferansNo = null;
        item.ArsivKlasorAdi = null;
        return;
    }

    const normName = normalize(item.BelgeAdi);
    
    // Kök menü ise (ParentId === null veya rootRules içinde doğrudan eşleşme)
    if (rootRules[normName] && item.ParentId === null) {
        const rule = rootRules[normName];
        item.DosyaNevi = rule.dosyaNevi;
        item.ArsivKlasorAdi = rule.klasor;
        item.ReferansNo = null;
        return;
    }

    // Değilse referanstan eşle
    let refItem = refMap.get(normName);
    if (refItem) {
        item.DosyaNevi = refItem.DosyaNevi;
        item.ReferansNo = refItem.ReferansNo;
        item.ArsivKlasorAdi = refItem.ArsivKlasorAdi;
    }
});

// 4. Kalıtım (Inheritance) - Eğer bir kalem referansta yoksa ebeveyninin klasörünü alsın
nihaiData.forEach(item => {
    if (item.ParentId !== null && !item.ArsivKlasorAdi) {
        const parent = nihaiData.find(p => p.Id === item.ParentId);
        if (parent && parent.ArsivKlasorAdi) {
            item.ArsivKlasorAdi = parent.ArsivKlasorAdi;
        }
    }
});

// 5. Kaydet
fs.writeFileSync(nihaiPath, JSON.stringify(nihaiData, null, 2), 'utf8');
console.log(`Düzeltme tamamlandı.`);
