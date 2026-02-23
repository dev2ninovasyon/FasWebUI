#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
import os

files_to_analyze = [
    ("BelgeKontrolCard.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\Cards\BelgeKontrolCard.tsx"),
    ("DenetimProgramiBelge.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\DenetimProgramiBelge.tsx"),
    ("GenelKurulToplantiBilgileriBelge.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\GenelKurulToplantiBilgileriBelge.tsx"),
    ("HileUsulsuzlukToplantiBilgileriBelge.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\HileUsulsuzlukToplantiBilgileriBelge.tsx"),
    ("CekSenetTablosu.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\MaddiDogrulama\CekSenetTablosu.tsx"),
    ("EnvanterKontrolleri.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\MaddiDogrulama\EnvanterKontrolleri.tsx"),
    ("FaturaTestleri.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\MaddiDogrulama\FaturaTestleri.tsx"),
    ("HasilatDonemsellikTesti.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\MaddiDogrulama\HasilatDonemsellikTesti.tsx"),
    ("KrediCalismasi.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\MaddiDogrulama\KrediCalismasi.tsx"),
    ("SonrakiDonemTestleri.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\MaddiDogrulama\SonrakiDonemTestleri.tsx"),
    ("StokDonemsellikTesti.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\MaddiDogrulama\StokDonemsellikTesti.tsx"),
    ("MaddiDogrulukGorevAtamalariBelge.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\MaddiDogrulukGorevAtamalariBelge.tsx"),
    ("TarihliCalismaKagidiBelge.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\TarihliCalismaKagidiBelge.tsx"),
    ("TekTarihliCalismaKagidiBelge.tsx", r"src\app\(Uygulama)\components\CalismaKagitlari\TekTarihliCalismaKagidiBelge.tsx"),
    ("KurFarkiKontrolleriForm.tsx", r"src\app\(Uygulama)\components\Hesaplamalar\KurFarkiKayitlari\KurFarkiKontrolleriForm.tsx"),
    ("SurekliEgitimBilgileriDuzenleForm.tsx", r"src\app\(Uygulama)\components\Kullanici\SurekliEgitimBilgileri\SurekliEgitimBilgileriDuzenleForm.tsx"),
    ("SurekliEgitimBilgileriEkleForm.tsx", r"src\app\(Uygulama)\components\Kullanici\SurekliEgitimBilgileri\SurekliEgitimBilgileriEkleForm.tsx"),
    ("DenetimSozlesmesiStep.tsx", r"src\app\(Uygulama)\components\SetupWizard\steps\DenetimSozlesmesiStep.tsx"),
    ("EDefterIncelemeForm.tsx", r"src\app\(Uygulama)\components\Veri\EDefterInceleme\EDefterIncelemeForm.tsx"),
    ("HaricFisListesiForm.tsx", r"src\app\(Uygulama)\components\Veri\HaricFisListesi\HaricFisListesiForm.tsx"),
    ("Mizan.tsx", r"src\app\(Uygulama)\components\Veri\Mizan\Mizan.tsx"),
    ("VukMizanStepper.tsx", r"src\app\(Uygulama)\components\Veri\VukMizan\VukMizanStepper.tsx"),
    ("AmortismanVeriYukleme.tsx", r"src\app\(Uygulama)\Hesaplamalar\Amortisman\AmortismanVeriYukleme.tsx"),
    ("CekSenetReeskontVeriYukleme.tsx", r"src\app\(Uygulama)\Hesaplamalar\CekSenetReeskont\CekSenetReeskontVeriYukleme.tsx"),
    ("KidemTazminatiBobiVeriYukleme.tsx", r"src\app\(Uygulama)\Hesaplamalar\KidemTazminatiBobi\KidemTazminatiBobiVeriYukleme.tsx"),
    ("KidemTazminatiTfrsVeriYukleme.tsx", r"src\app\(Uygulama)\Hesaplamalar\KidemTazminatiTfrs\KidemTazminatiTfrsVeriYukleme.tsx"),
    ("KrediVeriYukleme.tsx", r"src\app\(Uygulama)\Hesaplamalar\Kredi\KrediVeriYukleme.tsx"),
    ("VadeliBankaMevduatiFaizTahakkuk.tsx", r"src\app\(Uygulama)\Hesaplamalar\VadeliBankaMevduati\VadeliBankaMevduatiFaizTahakkuk\VadeliBankaMevduatiFaizTahakkuk.tsx"),
    ("FaaliyetRaporunaIliskinBagimsizDenetciRaporu.tsx", r"src\app\(Uygulama)\Rapor\FaaliyetRaporunaIliskinBagimsizDenetciRaporu\page.tsx"),
    ("BagimsizDenetimSozlesmesi.tsx", r"src\app\(Uygulama)\Sozlesme\BagimsizDenetimSozlesmesi\page.tsx"),
]

def analyze_file(file_path):
    """Analyze a file for date patterns."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        return None, f"Error reading: {e}"
    
    result = {
        'handsontable': False,
        'custom_date_picker': False,
        'type_date': False,
        'day_picker': False,
        'other_picker': False,
        'patterns': []
    }
    
    # Check for Handsontable
    if re.search(r'Handsontable|HotTable|@handsontable', content):
        result['handsontable'] = True
        for i, line in enumerate(lines, 1):
            if re.search(r'Handsontable|HotTable|@handsontable', line):
                result['patterns'].append(('HANDSONTABLE', i, line.strip()[:100]))
    
    # Check for CustomDatePicker
    if re.search(r'CustomDatePicker', content):
        result['custom_date_picker'] = True
        for i, line in enumerate(lines, 1):
            if 'CustomDatePicker' in line:
                result['patterns'].append(('CUSTOM_DATE_PICKER', i, line.strip()[:100]))
    
    # Check for type="date"
    if re.search(r'type\s*=\s*["\']date["\']', content):
        result['type_date'] = True
        for i, line in enumerate(lines, 1):
            if re.search(r'type\s*=\s*["\']date["\']', line):
                result['patterns'].append(('TYPE_DATE', i, line.strip()[:100]))
    
    # Check for react-day-picker
    if re.search(r'dayPicker|DayPicker|react-day-picker', content):
        result['day_picker'] = True
        for i, line in enumerate(lines, 1):
            if re.search(r'dayPicker|DayPicker|react-day-picker', line):
                result['patterns'].append(('DAY_PICKER', i, line.strip()[:100]))
    
    return result, None

# Analyze all files
report = []
for file_name, file_path in files_to_analyze:
    result, error = analyze_file(file_path)
    if error:
        report.append({
            'file': file_name,
            'status': 'ERROR',
            'error': error
        })
    else:
        report.append({
            'file': file_name,
            'result': result
        })

# Print report
for item in report:
    if 'error' in item:
        print(f"[ERROR] {item['file']}: {item['error']}")
    else:
        r = item['result']
        file_name = item['file']
        print(f"\n{file_name}:")
        print(f"  Handsontable: {r['handsontable']}")
        print(f"  CustomDatePicker: {r['custom_date_picker']}")
        print(f"  type=date: {r['type_date']}")
        print(f"  DayPicker: {r['day_picker']}")
        if r['patterns']:
            for pat in r['patterns'][:3]:  # Show first 3 patterns
                print(f"    {pat[0]} at line {pat[1]}: {pat[2]}")
