const fs = require('fs');
const path = require('path');

// Hedef yollar
const targetFile = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\DinamicMenu.json';
const sourceJson = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\DenetimDosyaBelgeleri.json';

// Özetlenmiş MenuItems verisi (Analiz sonucunda çıkarılan temel yapı)
const menuStructure = [
  {
    title: "PLAN VE PROGRAM",
    href: "/PlanVeProgram",
    children: [
      { title: "İşletmeyi Tanıma Belgesi", href: "/PlanVeProgram/IsletmeTanimaBelgesi", formKodu: "IsletmeTanimaBelgesi" },
      { title: "Müşteri İlişkileri ve Sözleşme Kabulü", href: "/PlanVeProgram/MusteriIliskileriVeSozlesmeKabulu", formKodu: "MusteriIliskileriVeSozlesmeKabulu" },
      // ... Diğer kalemler
    ]
  },
  {
    title: "DENETİM KANITLARI",
    href: "/DenetimKanitlari",
    children: [
      {
        title: "Maddi Doğrulama Prosedürleri",
        href: "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
        children: [
          // Dinamik kalemler buraya eklenecek (API'den simüle edilen)
          { 
            title: "Kasa", 
            children: [
              { title: "Uygulanan Denetim Prosedürleri", href: "/DenetimKanitlari/MaddiDogrulamaProsedurleri/Kasa/UygulananDenetimProsedurleri" },
              { title: "Hesaplara İlişkin Uygulanan Denetim Testleri", href: "/DenetimKanitlari/MaddiDogrulamaProsedurleri/Kasa/HesaplaraIliskinUygulananDenetimTestleri" }
            ]
          },
          { 
            title: "Bankalar", 
            children: [
              { title: "Uygulanan Denetim Prosedürleri", href: "/DenetimKanitlari/MaddiDogrulamaProsedurleri/Bankalar/UygulananDenetimProsedurleri" },
              { title: "Mutabakatlar", href: "/DenetimKanitlari/MaddiDogrulamaProsedurleri/Bankalar/Mutabakatlar" }
            ]
          },
          { 
            title: "Ticari Alacaklar", 
            children: [
              { title: "Uygulanan Denetim Prosedürleri", href: "/DenetimKanitlari/MaddiDogrulamaProsedurleri/TicariAlacaklar/UygulananDenetimProsedurleri" },
              { title: "Mutabakatlar", href: "/DenetimKanitlari/MaddiDogrulamaProsedurleri/TicariAlacaklar/Mutabakatlar" }
            ]
          },
          { 
            title: "Stoklar", 
            children: [
              { title: "Uygulanan Denetim Prosedürleri", href: "/DenetimKanitlari/MaddiDogrulamaProsedurleri/Stoklar/UygulananDenetimProsedurleri" },
              { title: "Stok Envanter Kayıtları", href: "/DenetimKanitlari/MaddiDogrulamaProsedurleri/Stoklar/StokEnvanterKayitlari" }
            ]
          }
        ]
      }
    ]
  }
];

let globalId = 1;
let globalSira = 1;

function processItems(items, parentId = null, dosyaNeviPrefix = "", refPrefix = "") {
  let result = [];
  items.forEach((item, index) => {
    const currentId = globalId++;
    const currentSira = globalSira++;
    const pos = (index + 1).toString().padStart(2, '0');
    
    // DosyaNevi formatı: 1.01.01...
    const dosyaNevi = dosyaNeviPrefix ? `${dosyaNeviPrefix}.${pos}` : pos;
    // ReferansNo formatı: -010101...
    const referansNo = `-${(refPrefix + pos).padEnd(6, '0')}`;

    result.push({
      Id: currentId,
      DosyaNevi: dosyaNevi,
      BelgeAdi: item.title,
      ReferansNo: referansNo,
      FormKodu: item.formKodu || "",
      ParentId: parentId,
      FormUrl: item.href || "",
      ArsivKlasorAdi: "CD",
      Bobimi: 1,
      Tfrsmi: 1,
      ArsivAdi: null,
      Sira: currentSira
    });

    if (item.children && item.children.length > 0) {
      result = result.concat(processItems(item.children, currentId, dosyaNevi, refPrefix + pos));
    }
  });
  return result;
}

const finalJson = processItems(menuStructure);
fs.writeFileSync(targetFile, JSON.stringify(finalJson, null, 2), 'utf8');
console.log(`JSON dosyası oluşturuldu: ${targetFile}`);
