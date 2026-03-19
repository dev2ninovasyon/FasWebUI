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

// 1. DenetimDosyaBelgeleri'nden harita oluştur
const refMap = new Map();
denetimData.forEach(item => {
    const key = normalize(item.BelgeAdi);
    if (!refMap.has(key)) {
        refMap.set(key, item);
    }
});

// Bazı özel kök menü eşleşmeleri (Normalizasyon dışında kalanlar veya geniş isimler)
const rootMatches = {
    "müşteri": "MÜŞTERİ TANIMA, TEKLİF VE SÖZLEŞME BELGELERİ",
    "müşteri belgeleri": "MÜŞTERİ BELGELERİ",
    "sözleşme": "SÖZLEŞME VE MÜŞTERİ KABUL BELGELERİ",
    "plan ve program": "DENETİM PLAN VE PROGRAMI BELGELERİ",
    "hesaplamalar": "YENİDEN HESAPLAMA BELGELERİ",
    "denetim kanıtları": "DENETİM KANITLARI",
    "maddi doğrulama prosedürleri": "MADDİ DOĞRULAMA PROSDÜRLERİ",
    "rapor": "DENETİM RAPORU, FİNANSAL TABLOLAR VE DİPNOTLAR",
    "enflasyon": "ENFLASYON DÜZELTMESİ",
    "sürdürülebilirlik": "SÜRDÜRÜLEBİLİRLİK RAPOR",
    "kys": "KALİTE YÖNETİM SİSTEMİ (KYS)"
};

// 2. Güncelleme
let count = 0;
nihaiData.forEach(item => {
    if (item.BelgeAdi === "Anasayfa") {
        item.DosyaNevi = null;
        item.ReferansNo = null;
        item.ArsivKlasorAdi = null;
        return;
    }

    const normName = normalize(item.BelgeAdi);
    let refItem = null;

    // Önce root eşleşmesi var mı bak
    if (rootMatches[normName]) {
        refItem = refMap.get(normalize(rootMatches[normName]));
    }

    // Yoksa direkt isim eşlemesi dene
    if (!refItem) {
        refItem = refMap.get(normName);
    }

    if (refItem) {
        item.DosyaNevi = refItem.DosyaNevi;
        item.ReferansNo = refItem.ReferansNo;
        item.ArsivKlasorAdi = refItem.ArsivKlasorAdi;
        count++;
    } else {
        // Bulunamazsa ParentId üzerinden klasör adını miras almayı deneyebiliriz
        // Şimdilik sadece bulabildiklerini güncelle diyelim veya manuel ayar yapalım
    }
});

// 3. Özel düzeltme: Müşteri her durumda CD-01, Müşteri Belgeleri CD-02 olmalı
const musteri = nihaiData.find(i => i.BelgeAdi === "Müşteri" && i.ParentId === null);
if (musteri) {
    musteri.DosyaNevi = "CD-01.";
    musteri.ArsivKlasorAdi = "CD-01";
    // Çocuklarını da CD-01 yap (Eğer referansta bulunamadıysa)
    nihaiData.filter(i => i.ParentId === musteri.Id).forEach(c => {
        if (!c.ArsivKlasorAdi) c.ArsivKlasorAdi = "CD-01";
    });
}

const mb = nihaiData.find(i => i.BelgeAdi === "Müşteri Belgeleri" && i.ParentId === null);
if (mb) {
    mb.DosyaNevi = "CD-02.";
    mb.ArsivKlasorAdi = "CD-02";
    // MB çocukları zaten CD-02'dir muhtemelen ama garantiye alalım
    nihaiData.filter(i => i.ParentId === mb.Id).forEach(c => {
        c.ArsivKlasorAdi = "CD-02";
    });
}

// 4. Kaydet
fs.writeFileSync(nihaiPath, JSON.stringify(nihaiData, null, 2), 'utf8');
console.log(`Düzeltme tamamlandı. ${count} kalem güncellendi.`);
