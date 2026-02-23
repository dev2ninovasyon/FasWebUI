const fs = require('fs');
const path = require('path');

const files = [
  { name: "BelgeKontrolCard.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard.tsx" },
  { name: "DenetimProgramiBelge.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/DenetimProgramiBelge.tsx" },
  { name: "GenelKurulToplantiBilgileriBelge.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/GenelKurulToplantiBilgileriBelge.tsx" },
  { name: "HileUsulsuzlukToplantiBilgileriBelge.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/HileUsulsuzlukToplantiBilgileriBelge.tsx" },
  { name: "CekSenetTablosu.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/CekSenetTablosu.tsx" },
  { name: "EnvanterKontrolleri.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/EnvanterKontrolleri.tsx" },
  { name: "FaturaTestleri.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/FaturaTestleri.tsx" },
  { name: "HasilatDonemsellikTesti.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/HasilatDonemsellikTesti.tsx" },
  { name: "KrediCalismasi.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/KrediCalismasi.tsx" },
  { name: "SonrakiDonemTestleri.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/SonrakiDonemTestleri.tsx" },
  { name: "StokDonemsellikTesti.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/StokDonemsellikTesti.tsx" },
  { name: "MaddiDogrulukGorevAtamalariBelge.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulukGorevAtamalariBelge.tsx" },
  { name: "TarihliCalismaKagidiBelge.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/TarihliCalismaKagidiBelge.tsx" },
  { name: "TekTarihliCalismaKagidiBelge.tsx", path: "src/app/(Uygulama)/components/CalismaKagitlari/TekTarihliCalismaKagidiBelge.tsx" },
  { name: "KurFarkiKontrolleriForm.tsx", path: "src/app/(Uygulama)/components/Hesaplamalar/KurFarkiKayitlari/KurFarkiKontrolleriForm.tsx" },
  { name: "SurekliEgitimBilgileriDuzenleForm.tsx", path: "src/app/(Uygulama)/components/Kullanici/SurekliEgitimBilgileri/SurekliEgitimBilgileriDuzenleForm.tsx" },
  { name: "SurekliEgitimBilgileriEkleForm.tsx", path: "src/app/(Uygulama)/components/Kullanici/SurekliEgitimBilgileri/SurekliEgitimBilgileriEkleForm.tsx" },
  { name: "DenetimSozlesmesiStep.tsx", path: "src/app/(Uygulama)/components/SetupWizard/steps/DenetimSozlesmesiStep.tsx" },
  { name: "EDefterIncelemeForm.tsx", path: "src/app/(Uygulama)/components/Veri/EDefterInceleme/EDefterIncelemeForm.tsx" },
  { name: "HaricFisListesiForm.tsx", path: "src/app/(Uygulama)/components/Veri/HaricFisListesi/HaricFisListesiForm.tsx" },
  { name: "Mizan.tsx", path: "src/app/(Uygulama)/components/Veri/Mizan/Mizan.tsx" },
  { name: "VukMizanStepper.tsx", path: "src/app/(Uygulama)/components/Veri/VukMizan/VukMizanStepper.tsx" },
  { name: "AmortismanVeriYukleme.tsx", path: "src/app/(Uygulama)/Hesaplamalar/Amortisman/AmortismanVeriYukleme.tsx" },
  { name: "CekSenetReeskontVeriYukleme.tsx", path: "src/app/(Uygulama)/Hesaplamalar/CekSenetReeskont/CekSenetReeskontVeriYukleme.tsx" },
  { name: "KidemTazminatiBobiVeriYukleme.tsx", path: "src/app/(Uygulama)/Hesaplamalar/KidemTazminatiBobi/KidemTazminatiBobiVeriYukleme.tsx" },
  { name: "KidemTazminatiTfrsVeriYukleme.tsx", path: "src/app/(Uygulama)/Hesaplamalar/KidemTazminatiTfrs/KidemTazminatiTfrsVeriYukleme.tsx" },
  { name: "KrediVeriYukleme.tsx", path: "src/app/(Uygulama)/Hesaplamalar/Kredi/KrediVeriYukleme.tsx" },
  { name: "VadeliBankaMevduatiFaizTahakkuk.tsx", path: "src/app/(Uygulama)/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiFaizTahakkuk/VadeliBankaMevduatiFaizTahakkuk.tsx" },
  { name: "FaaliyetRaporunaIliskinBagimsizDenetciRaporu.tsx", path: "src/app/(Uygulama)/Rapor/FaaliyetRaporunaIliskinBagimsizDenetciRaporu/page.tsx" },
  { name: "BagimsizDenetimSozlesmesi.tsx", path: "src/app/(Uygulama)/Sozlesme/BagimsizDenetimSozlesmesi/page.tsx" },
];

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const result = {
      handsontable: false,
      customDatePicker: false,
      typeDate: false,
      dayPicker: false,
      patterns: []
    };
    
    // Check patterns
    const patterns = [
      { key: 'handsontable', regex: /Handsontable|HotTable|@handsontable/, label: 'HANDSONTABLE' },
      { key: 'customDatePicker', regex: /CustomDatePicker/, label: 'CUSTOM_DATE_PICKER' },
      { key: 'typeDate', regex: /type\s*=\s*['"]date['"]/, label: 'TYPE_DATE' },
      { key: 'dayPicker', regex: /dayPicker|DayPicker|react-day-picker/, label: 'DAY_PICKER' }
    ];
    
    for (const { key, regex, label } of patterns) {
      for (let i = 0; i < lines.length; i++) {
        if (regex.test(lines[i])) {
          result[key] = true;
          result.patterns.push({
            type: label,
            line: i + 1,
            text: lines[i].substring(0, 80)
          });
        }
      }
    }
    
    return result;
  } catch (err) {
    return { error: err.message };
  }
}

// Main
console.log('DATE FORMAT ANALYSIS REPORT\n' + '='.repeat(80) + '\n');

for (const file of files) {
  const result = analyzeFile(file.path);
  console.log(`\n${file.name}:`);
  
  if (result.error) {
    console.log(`  ERROR: ${result.error}`);
  } else {
    console.log(`  Handsontable: ${result.handsontable}`);
    console.log(`  CustomDatePicker: ${result.customDatePicker}`);
    console.log(`  type="date": ${result.typeDate}`);
    console.log(`  DayPicker: ${result.dayPicker}`);
    
    if (result.patterns.length > 0) {
      console.log(`  Patterns (first 3):`);
      result.patterns.slice(0, 3).forEach(p => {
        console.log(`    Line ${p.line}: [${p.type}] ${p.text}`);
      });
    }
  }
}
