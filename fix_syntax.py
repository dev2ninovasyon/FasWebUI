import re
import os

# Fix files with broken syntax
base_dir = r'C:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\src'

files_to_fix = [
    r'C:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\src\app\(Uygulama)\Donusum\FisListesi\FisListesi.tsx',
    r'C:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\src\app\(Uygulama)\Donusum\HazirFisler\HazirFisListesi.tsx',
    r'C:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\src\app\(Uygulama)\Enflasyon\DuzeltmeIslemleri\FisGirisi\EnflasyonSonGirilenFisler.tsx',
    r'C:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\src\app\(Uygulama)\Enflasyon\DuzeltmeIslemleri\FisIslemleri\FisListesi.tsx',
    r'C:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\src\app\(Uygulama)\Konsolidasyon\FisListesi\FisListesi.tsx',
]

for filepath in files_to_fix:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Fix: updateSettings with just "2," or similar broken remnants
    # Pattern: updateSettings({\n2,\n    });  -> should be removed or kept as empty
    content = re.sub(
        r'(updateSettings\(\{)\s*\n\s*\d+,\s*\n(\s*\}\);)',
        lambda m: None if False else '',  # remove the whole block if it's empty
        content
    )

    # Actually let's do it more carefully
    # Match pattern: .updateSettings({\nNUMBER,\n    });
    # This whole updateSettings call should become empty: .updateSettings({});
    content = re.sub(
        r'\.updateSettings\(\{\s*\n\s*\d+,\s*\n\s*\}\)',
        '.updateSettings({})',
        content
    )

    # Also fix "licenseKey: 'non-commercial-and-evaluation'\ncontextMenu:"
    # which is missing comma between
    content = re.sub(
        r"(licenseKey:\s*'non-commercial-and-evaluation')\s*\n(\s*contextMenu:)",
        r"\1,\n\2",
        content
    )
    content = re.sub(
        r"(licenseKey:\s*'non-commercial-and-evaluation')\s*\n(\s*copyPaste:)",
        r"\1,\n\2",
        content
    )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {os.path.basename(filepath)}")
    else:
        print(f"No change: {os.path.basename(filepath)}")

print("Done")
