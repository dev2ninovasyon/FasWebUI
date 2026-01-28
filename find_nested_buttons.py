#!/usr/bin/env python3
import os
import re
from pathlib import Path

def find_nested_buttons(root_dir):
    """
    Tüm TSX dosyalarında iç içe Button bileşenlerini bulur.
    """
    results = []
    tsx_pattern = re.compile(r'\.tsx$')
    button_pattern = re.compile(r'<Button|<ButtonBase')
    close_pattern = re.compile(r'</Button>|</ButtonBase>')
    
    # TSX dosyalarını bul
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.tsx'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = f.readlines()
                    
                    # Her satırı kontrol et
                    for i, line in enumerate(lines):
                        if button_pattern.search(line) and not line.strip().startswith('//'):
                            line_num = i + 1
                            # Button kapanana kadar arar
                            for j in range(i + 1, min(i + 50, len(lines))):
                                # İç içe button var mı?
                                if button_pattern.search(lines[j]) and not lines[j].strip().startswith('//'):
                                    nested_line = j + 1
                                    # Relative path oluştur
                                    rel_path = os.path.relpath(file_path, root_dir)
                                    results.append({
                                        'file': rel_path,
                                        'line': line_num,
                                        'nested_line': nested_line
                                    })
                                    break
                                if close_pattern.search(lines[j]):
                                    break
                except Exception as e:
                    print(f"Hata {file_path}: {e}")
    
    return results

if __name__ == '__main__':
    root = 'src'
    results = find_nested_buttons(root)
    
    if results:
        print("\n" + "="*100)
        print("İÇ İÇE BUTTON BİLEŞENLERİ BULUNDU")
        print("="*100 + "\n")
        
        for i, result in enumerate(results, 1):
            print(f"{i}. Dosya: {result['file']}")
            print(f"   Button satırı {result['line']} içinde iç Button satırı {result['nested_line']} bulundu")
            print()
    else:
        print("İç içe Button bileşeni bulunamadı.")
