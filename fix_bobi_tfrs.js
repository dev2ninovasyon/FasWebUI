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

// 1. Referans Haritası oluştur (BelgeAdi -> {Bobimi, Tfrsmi})
const refMap = new Map();
denetimData.forEach(item => {
    const key = normalize(item.BelgeAdi);
    // Eğer aynı isimde birden fazla varsa, ilk karşılaşılanı alabiliriz (veya bir mantık kurabiliriz)
    if (!refMap.has(key)) {
        refMap.set(key, { bobimi: item.Bobimi, tfrsmi: item.Tfrsmi });
    }
});

// 2. Nihai Menüleri güncelle
let bobiOnly = 0;
let tfrsOnly = 0;
let updated = 0;

nihaiData.forEach(item => {
    const normName = normalize(item.BelgeAdi);
    const ref = refMap.get(normName);

    if (ref) {
        // Eğer referansta farklı bir değer varsa güncelle
        if (item.Bobimi !== ref.bobimi || item.Tfrsmi !== ref.tfrsmi) {
            item.Bobimi = ref.bobimi;
            item.Tfrsmi = ref.tfrsmi;
            updated++;
        }
        
        if (ref.bobimi === 1 && ref.tfrsmi === 0) bobiOnly++;
        if (ref.bobimi === 0 && ref.tfrsmi === 1) tfrsOnly++;
    } else {
        // Referansta bulunamayanlar (Kök menüler vb.) genellikle her ikisinde de vardır
        // item.Bobimi = 1; item.Tfrsmi = 1; (Mevcut haliyle bırakalım veya set edelim)
    }
});

// 3. Kalıtım (Inheritance): Eğer bir ebeveyn sadece Bobi/Tfrs ise tüm çocukları da öyle olmalı (veya tam tersi)
// Ancak referans verisi daha güvenilir. Eğer referansta yoksa ebeveyne bakabiliriz.
nihaiData.forEach(item => {
    if (item.ParentId !== null) {
        const parent = nihaiData.find(p => p.Id === item.ParentId);
        if (parent && (parent.Bobimi === 0 || parent.Tfrsmi === 0)) {
            // Sadece referansta bulamadıklarımız için ebeveyn kuralını uygulayalım (opsiyonel)
            // item.Bobimi = parent.Bobimi;
            // item.Tfrsmi = parent.Tfrsmi;
        }
    }
});

// 4. Kaydet
fs.writeFileSync(nihaiPath, JSON.stringify(nihaiData, null, 2), 'utf8');

console.log(`Bobi/Tfrs güncellemesi tamamlandı.`);
console.log(`Güncellenen kalem sayısı: ${updated}`);
console.log(`Sadece Bobi (Bobimi=1, Tfrsmi=0): ${bobiOnly}`);
console.log(`Sadece Tfrs (Bobimi=0, Tfrsmi=1): ${tfrsOnly}`);
