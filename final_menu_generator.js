const fs = require('fs');

// Kullanıcıdan gelen dinamik veriler
const dynamicData = [
  { "name": "Finansal Tablolar", "reference": "23CD03-060100-01", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri"] },
  { "name": "Dipnot Açıklamaları", "reference": "23CD03-060100-02", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri"] },
  { "name": "Nakit ve Nakit Benzerleri", "reference": "23CD03-060100-04", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol", "Mutabakatlar(VUK)"] },
  { "name": "Finansal Varlık ve Yatırımlar", "reference": "23CD03-060100-06", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "name": "Ticari Alacaklar", "reference": "23CD03-060100-07", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Mutabakatlar(VUK)", "Reeskont Testleri", "Çek Senet Tablosu", "Fatura Testleri", "Süpheli Alacak Testleri", "Sonraki Dönem Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol", "Hareketsiz Ticari Alacaklar"] },
  { "name": "Ticari Borçlar", "reference": "23CD03-060100-08", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Mutabakatlar(VUK)", "Reeskont Testleri", "Çek Senet Tablosu", "Fatura Testleri", "Sonraki Dönem Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "name": "Stoklar", "reference": "23CD03-060100-11", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Mutabakatlar(VUK)", "Sözlesme Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Stok Dönemsellik Testi", "Stoklar Net Gerçeklesebilir Deger", "Dönüsüm Kayitlari Kontrol", "Hareketsiz Stoklar"] },
  { "name": "Maddi Duran Varlıklar", "reference": "23CD03-060100-21", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Amortisman Kontrolleri", "Varlik ve Amortisman Özet Tablo", "Degerleme ve Deger Düsüklügü Kontrolleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] }
];

// Menü Hiyerarşisi (Genişletilmiş)
const menuHierarchy = [
    { title: "ANASAYFA", href: "/Anasayfa" },
    { title: "MÜŞTERİ", href: "/Musteri", children: [
        { title: "Müşteri İşlemleri", href: "/Musteri/MusteriIslemleri", formKodu: "MusteriIslemleri" },
        { title: "Şirket Yönetim Kadrosu", href: "/Musteri/SirketYonetimKadrosu", formKodu: "SirketYonetimKadrosu" },
        { title: "Şubeler", href: "/Musteri/Subeler", formKodu: "Subeler" },
        { title: "Hissedarlar", href: "/Musteri/Hissedarlar", formKodu: "Hissedarlar" },
        { title: "İşletme Tanıma", href: "/Musteri/IsletmeTanima", formKodu: "IsletmeTanimaBelgesi" }
    ]},
    { title: "PLAN VE PROGRAM", href: "/PlanVeProgram", children: [
        { title: "Denetim Programı", href: "/PlanVeProgram/DenetimProgrami", formKodu: "DenetimProgrami" },
        { title: "Denetim Planı", href: "/PlanVeProgram/DenetimPlani", formKodu: "DenetimPlani" },
        { title: "Önemlilik Ve Örneklem", href: "/PlanVeProgram/DenetimPlanindaOnemlilik/OnemlilikVeOrneklem", formKodu: "OnemlilikVeOrneklem" }
    ]},
    { title: "HESAPLAMALAR", href: "/Hesaplamalar", children: [
        { title: "Yaşlandırma", href: "/Hesaplamalar/Yaslandirma" },
        { title: "Beklenen Kredi Zararı", href: "/Hesaplamalar/BeklenenKrediZarari" },
        { title: "Amortisman", href: "/Hesaplamalar/Amortisman" },
        { title: "Adat Hesaplama", href: "/hesaplamalar/adat-hesaplama" }
    ]},
    { title: "DÖNÜŞÜM", href: "/Donusum", children: [
        { title: "Fiş Girişi", href: "/Donusum/FisGirisi" },
        { title: "Fiş Listesi", href: "/Donusum/FisListesi" }
    ]},
    { title: "DENETİM KANITLARI", href: "/DenetimKanitlari", children: [
        { title: "Finansal Tablolar", href: "/DenetimKanitlari/FinansalTablolar" },
        { 
            title: "Maddi Doğrulama Prosedürleri", 
            href: "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
            isMaddiDogrulama: true 
        }
    ]}
];

let globalId = 1;
let globalSira = 1;

function slugify(text) {
    if (!text) return "";
    return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

function generateNodes(nodes, parentId = null, depthPrefix = "", refPrefix = "") {
    let results = [];
    nodes.forEach((item, index) => {
        const id = globalId++;
        const currentSira = globalSira++;
        const indexStr = (index + 1).toString().padStart(2, '0');
        const dosyaNevi = depthPrefix ? `${depthPrefix}.${indexStr}` : indexStr;
        let referansNo = item.reference || `-${(refPrefix + indexStr).padEnd(6, '0')}`;
        
        results.push({
            "Id": id,
            "DosyaNevi": dosyaNevi,
            "BelgeAdi": item.title || item.name,
            "ReferansNo": referansNo,
            "FormKodu": item.formKodu || "",
            "ParentId": parentId,
            "FormUrl": item.href || "",
            "ArsivKlasorAdi": "CD",
            "Bobimi": 1,
            "Tfrsmi": 1,
            "ArsivAdi": null,
            "Sira": currentSira
        });
        
        if (item.isMaddiDogrulama) {
            const subItems = dynamicData.map(d => ({
                name: d.name,
                reference: d.reference,
                href: `${item.href}/${slugify(d.name)}`,
                children: d.children.map(c => ({
                    name: c,
                    href: `${item.href}/${slugify(d.name)}/${slugify(c)}`
                }))
            }));
            results = results.concat(generateNodes(subItems, id, dosyaNevi, refPrefix + indexStr));
        } else if (item.children && Array.isArray(item.children)) {
            results = results.concat(generateNodes(item.children, id, dosyaNevi, refPrefix + indexStr));
        }
    });
    return results;
}

const finalJson = generateNodes(menuHierarchy);
fs.writeFileSync('c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\DenetimDosyaBelgeleri.json', JSON.stringify(finalJson, null, 2), 'utf8');
console.log('DenetimDosyaBelgeleri.json başarıyla oluşturuldu.');
