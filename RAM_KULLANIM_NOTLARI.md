# RAM Kullanim Notlari

Bu not, uygulamayi kullanirken RAM artis/pik durumunu izlemek icin hizli adimlari icerir.

## 1) Olcum komutlari

```bash
npm run ram:build
npm run ram:dev
npm run ram:benchmark
```

## 2) Gercek kullanim testi (onerilen)

1. Terminal 1:

```bash
npm run dev
```

2. Tarayicida uygulamayi ac ve normal is akisinda 10-15 dakika gez:
- Bildirim ac/kapat
- Veri tablolari arasinda gecis
- Excel disa aktarim butonlarini birkac kez dene

3. Terminal 2'de RAM izleme:

```powershell
Get-Process node | Select-Object Id,ProcessName,WS,PM,CPU | Sort-Object WS -Descending
```

WS degeri Working Set (anlik RAM) icindir.

## 3) Bildirim sistemi icin yeni koruma

Asagidaki korumalar eklendi (`src/api/BaglantiBilgileri/BaglantiBilgileri.ts`):
- Tek aktif polling (ayni anda birden fazla interval yok)
- Tek aktif SignalR baglanti denemesi (parallel connect yok)
- Polling overlap engeli (onceki is bitmeden yenisi calismaz)
- Stop sirasinda callback/polling temizligi

## 4) Beklenen etki

- Uzun kullanimda RAM'in surekli yukari suruklenmesi azalir.
- Bildirim baglantisi kaynakli ani pikler (peak) duser.
- Tam oran, kullanim senaryosuna gore degisir; en dogru sonuc icin `ram:dev` + gercek ekran gezinti testi yap.
