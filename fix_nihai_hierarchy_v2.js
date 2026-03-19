const fs = require('fs');

const nihaiPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\NihaiMenuler.json';
let data = JSON.parse(fs.readFileSync(nihaiPath, 'utf8'));

// 1. Kök Menü için Base X.YY Tanımları
const rootBaseMap = {
    "Müşteri": "1.01",
    "Sürekli Dosya": "1.02",
    "Müşteri Belgeleri": "2.01",
    "Sözleşme": "3.01",
    "Veri": "4.01",
    "Plan Ve Program": "4.01",
    "Hesaplamalar": "3.01",
    "Dönüşüm": "8.01",
    "Denetim Kanıtları": "5.01",
    "Maddi Doğrulama Prosedürleri": "6.01",
    "Genel Kurul": "8.01",
    "Rapor": "7.01",
    "Enflasyon": "11.01",
    "Sürdürülebilirlik": "12.01",
    "Konsolidasyon": "14.01",
    "Bddk": "15.01",
    "Kys": "13.01",
    "Denetim Dosya": "18.01",
    "Diğer İşlemler": "19.01",
    "Kullanım Kılavuzu": "20.01"
};

// 2. Fonksiyon: DosyaNevi ve ReferansNo üret
function formatDosyaNevi(x, yy, zz, ww) {
    return `${x}.${yy}.${zz}.${ww}`;
}

function formatReferansNo(x, yy, zz, ww) {
    let rX = String(x).padStart(2, '0');
    let rYY = String(yy).padStart(2, '0');
    let rZZ = String(zz).padStart(2, '0');
    let rWW = String(ww).padStart(2, '0');
    return `-${rX}${rYY}${rZZ}-${rWW}`;
}

// 3. İşleme
const itemMap = new Map();
data.forEach(item => itemMap.set(item.Id, item));

function processLevel(parentId, baseX, baseYY, parentWW = "00") {
    const children = data.filter(c => c.ParentId === parentId);
    // Sira'ya göre sıralayalım
    children.sort((a, b) => a.Sira - b.Sira || a.Id - b.Id);

    children.forEach((child, idx) => {
        const ww = String(idx + 1).padStart(2, '0');
        const zz = parentWW;
        
        child.DosyaNevi = formatDosyaNevi(baseX, baseYY, zz, ww);
        child.ReferansNo = formatReferansNo(baseX, baseYY, zz, ww);
        child.Sira = idx + 1; // Sira'yı da normalize et

        // Alt seviyeye geç
        processLevel(child.Id, baseX, baseYY, ww);
    });
}

// Kök menüleri işle
const roots = data.filter(r => r.ParentId === null);
roots.sort((a, b) => a.Sira - b.Sira || a.Id - b.Id);

roots.forEach((root, idx) => {
    root.Sira = idx + 1;
    if (root.BelgeAdi === "Anasayfa") {
        root.DosyaNevi = null;
        root.ReferansNo = null;
        root.ArsivKlasorAdi = null;
        return;
    }

    // Base X.YY belirle
    const base = rootBaseMap[root.BelgeAdi] || rootBaseMap[root.BelgeAdi.split(' ')[0]] || `${idx + 1}.01`;
    const [x, yy] = base.split('.');
    
    // Kökün kendi DosyaNevi genellikle CD-XX. formatındadır
    // Eğer klasör adı yoksa veya yanlışsa düzelt
    if (!root.ArsivKlasorAdi || root.ArsivKlasorAdi === "null") {
        root.ArsivKlasorAdi = `CD-${String(x).padStart(2, '0')}`;
    }
    root.DosyaNevi = `${root.ArsivKlasorAdi.replace('CD-', '').replace('SD-', '') === '01' && root.BelgeAdi.includes('Sürekli') ? 'SD-01' : root.ArsivKlasorAdi}.`;
    root.ReferansNo = null;

    // Çocukları işle
    processLevel(root.Id, x, yy, "00");
});

// 4. Id yeniden numaralandırma (Bütünlük için en son yapalım)
const oldToNew = new Map();
data.forEach((item, idx) => {
    const newId = idx + 1;
    oldToNew.set(item.Id, newId);
    item.Id = newId;
});

data.forEach(item => {
    if (item.ParentId !== null && item.ParentId !== undefined) {
        item.ParentId = oldToNew.get(item.ParentId) || null;
    }
});

// 5. Kaydet
fs.writeFileSync(nihaiPath, JSON.stringify(data, null, 2), 'utf8');

console.log('Hiyerarşik düzenleme tamamlandı.');
const sample = data.find(i => i.ParentId !== null && i.BelgeAdi.includes('Cebri'));
if (sample) {
    console.log(`Örnek (Çocuk): ${sample.BelgeAdi}`);
    console.log(`  DosyaNevi: ${sample.DosyaNevi}`);
    console.log(`  ReferansNo: ${sample.ReferansNo}`);
}
