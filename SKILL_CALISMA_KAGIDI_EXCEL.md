---
name: calisma-kagidi-excel
description: Use this skill when implementing a new CalismaKagitlari page from an Excel file. Covers: reading Excel seed data, backend entity extension + migration + bulk-save endpoint, and frontend table component with IslemlerCardHtml PDF/Word export. Follow every step exactly to match existing pages.
---

# Skill: Excel → Çalışma Kağıdı Sayfası (Full Stack)

**Proje**: FasWebUI + FasWebAPI  
**Alanı**: PlanVeProgram / CalismaKagitlari  
**Güncel Örnekler**:
- `BilgiIslemMuhasebe` — Evet/Hayır RadioGroup + risk chip
- `TespitEdilenRiskler` — 6 boolean checkbox + collapsible detay
- `IsletmeyeIliskinIcKontrolTespit` — Evet/Hayır + risk chip + grup başlığı

---

## Tüm Dosya Yolları (Hızlı Referans)

Aşağıdaki tabloda `{ModelAdi}` = PascalCase model adı (ör. `YeniKontrolBelgesi`),  
`{tablo_adi}` = snake_case DB tablo adı (ör. `yeni_kontrol_belgesi`).

### FasWebAPI

| Dosya | Tam Yol |
|-------|---------|
| Entity | `FasWebAPI/Model/CalismaKagitlari/{ModelAdi}.cs` |
| Configuration | `FasWebAPI/Model/Configurations/CalismaKagitlari/{ModelAdi}Configuration.cs` |
| Migration | `FasWebAPI/Data/Migrations/{yyyyMMddHHmmss}_Add{ModelAdi}ExtendedFields.cs` |
| DTO | `FasWebAPI/Model/Dtos/CalismaKagitlari/{ModelAdi}KaydetDto.cs` |
| Repository Interface | `FasWebAPI/Repository/Abstract/CalismaKagitlari/I{ModelAdi}Repository.cs` |
| Repository Concrete | `FasWebAPI/Repository/Concrete/CalismaKagitlari/{ModelAdi}Repository.cs` |
| Service Interface | `FasWebAPI/Services/Abstract/CalismaKagitlari/I{ModelAdi}Service.cs` |
| Service Concrete | `FasWebAPI/Services/Concrete/CalismaKagitlari/{ModelAdi}Service.cs` |
| Controller | `FasWebAPI/Controllers/CalismaKagitlari/{ModelAdi}Controller.cs` |

> **DI kaydı gerekmez.** Proje reflection tabanlı auto-registration kullanıyor —  
> Repository ve Service sınıfları klasöre eklenince otomatik inject edilir.

### FasWebUI

| Dosya | Tam Yol |
|-------|---------|
| API fonksiyonları | `FasWebUI/src/api/CalismaKagitlari/{ModelAdi}.ts` |
| Table bileşeni | `FasWebUI/src/app/(Uygulama)/components/CalismaKagitlari/{ModelAdi}Table.tsx` |
| Page | `FasWebUI/src/app/(Uygulama)/PlanVeProgram/{ModelAdi}/page.tsx` |
| Menü kaydı | `FasWebUI/src/app/(Uygulama)/components/Layout/Vertical/Sidebar/MenuItems.ts` |
| IslemlerCardHtml | `FasWebUI/src/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCardHtml.tsx` |
| BelgeKontrolCard | `FasWebUI/src/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard.tsx` |
| EkBelgeYukleButton | `FasWebUI/src/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton.tsx` |

---

## Genel Akış (Her yeni sayfa için)

```
Excel dosyası
  ↓
1. Excel'i oku → seed satırları belirle
  ↓
2. Backend: entity alanları ekle → configuration → migration (seed UPDATE'leri dahil)
  ↓
3. Backend: DTO → Repository.Kaydet → Service.Kaydet → Controller endpoint'leri
  ↓
4. Frontend: API fonksiyonları (apiFetch) → Table bileşeni → Page.tsx
  ↓
5. Migration DB'ye uygula (Dev + Prod)
```

---

## BÖLÜM 1 — Excel Analizi

Excel dosyası verildiğinde:

1. Kaç sheet var? Her sheet'in adı nedir?
2. Her sheet'teki sütun yapısı: hangi kolonlar sabit metin (soru/islem), hangileri kullanıcı girişi?
3. Seed satırları: `DenetlenenId IS NULL` olan standart şablon satırları — bunlar migration'da UPDATE ile doldurulur.
4. Pattern belirle:
   - **Evet/Hayır çifti** → her soru için iki satır (EvetRiskSeviyesi, EvetIcerik, HayirRiskSeviyesi, HayirIcerik alanları)
   - **Tek satır + boolean kolonlar** → her risk/konu bir satır, beyan kategorileri boolean
   - **Sadece metin** → soru + açıklama

---

## BÖLÜM 2 — Backend

### 2a. Entity Alanları

`FasWebAPI/Model/CalismaKagitlari/{ModelAdi}.cs`'e alanlar ekle:

```csharp
// Standart şablon alanları (seed datadan geliyor)
public int? SatirNo { get; set; }
public string? Bolum { get; set; }       // varsa

// Pattern A: Evet/Hayır çifti
public string? EvetRiskSeviyesi { get; set; }
public string? EvetIcerik { get; set; }
public string? EvetDenetimAksiyonu { get; set; }
public string? HayirRiskSeviyesi { get; set; }
public string? HayirIcerik { get; set; }
public string? HayirDenetimAksiyonu { get; set; }
public string? IlgiliBds { get; set; }

// Pattern B: Uzun metin alanları
public string? UygulananDenetimTeknikleri { get; set; }
public string? IlgiliBdsStandart { get; set; }
```

### 2b. Configuration

`FasWebAPI/Model/Configurations/CalismaKagitlari/{ModelAdi}Configuration.cs`'e ekle:

```csharp
builder.Property(x => x.SatirNo).HasColumnType("int");
builder.Property(x => x.EvetIcerik).HasColumnType("MEDIUMTEXT");
builder.Property(x => x.EvetDenetimAksiyonu).HasColumnType("MEDIUMTEXT");
builder.Property(x => x.HayirIcerik).HasColumnType("MEDIUMTEXT");
builder.Property(x => x.HayirDenetimAksiyonu).HasColumnType("MEDIUMTEXT");
builder.Property(x => x.IlgiliBds).HasColumnType("MEDIUMTEXT");
builder.Property(x => x.EvetRiskSeviyesi).HasColumnType("varchar(20)");
builder.Property(x => x.HayirRiskSeviyesi).HasColumnType("varchar(20)");
```

### 2c. Migration

`FasWebAPI/Data/Migrations/{timestamp}_Add{ModelAdi}ExtendedFields.cs`

**Kritik kurallar:**
- `migrationBuilder.AddColumn<string>` için `nullable: true` kullan
- Her seed UPDATE için ayrı `migrationBuilder.Sql()` çağrısı
- Türkçe karakterler ve `'` karakterleri SQL içinde kaçırılmalı (`''` ile)
- Satır sonu `\n` → SQL'de literal newline değil, `CHAR(10)` veya string literal `\n` (backend C# string içinde `\\n`)
- `DenetlenenId IS NULL` filtresiyle sadece standart şablon satırları güncellenir

```csharp
public partial class Add{ModelAdi}ExtendedFields : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // 1. Sütun ekle
        migrationBuilder.AddColumn<string>("{AlanAdi}", table: "{tablo_adi}",
            type: "MEDIUMTEXT", nullable: true);
        // ... diğer alanlar

        // 2. Seed UPDATE'leri (her satır için ayrı)
        migrationBuilder.Sql(@"UPDATE {tablo_adi}
            SET SatirNo=1,
                EvetRiskSeviyesi='Düşük',
                EvetIcerik='...',
                EvetDenetimAksiyonu='...',
                HayirRiskSeviyesi='Kritik',
                HayirIcerik='...',
                HayirDenetimAksiyonu='...',
                IlgiliBds='BDS 315 §A56'
            WHERE Islem='...' AND DenetlenenId IS NULL");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn("{AlanAdi}", "{tablo_adi}");
        // ... diğer alanlar
    }
}
```

**Migration için Python script** (uzun seed datalar için):

```python
# migration_generator.py
def sql_escape(text):
    return str(text or "").replace("'", "''")

rows = [
    # (satirNo, islem, evetRisk, evetIcerik, hayirRisk, hayirIcerik, ilgiliBds)
    ...
]

for i, (no, islem, er, ei, hr, hi, bds) in enumerate(rows, 1):
    print(f"""migrationBuilder.Sql(@"UPDATE {tablo}
        SET SatirNo={no},
            EvetRiskSeviyesi='{sql_escape(er)}',
            EvetIcerik='{sql_escape(ei)}',
            HayirRiskSeviyesi='{sql_escape(hr)}',
            HayirIcerik='{sql_escape(hi)}',
            IlgiliBds='{sql_escape(bds)}'
        WHERE Islem='{sql_escape(islem)}' AND DenetlenenId IS NULL");""")
```

### 2d. DTO

`FasWebAPI/Model/Dtos/CalismaKagitlari/{ModelAdi}KaydetDto.cs`

```csharp
public class {ModelAdi}SatirDto
{
    public int Id { get; set; }
    public string Durum { get; set; } = "Evet";   // Pattern A
    public string? Tespit { get; set; }             // Pattern A
    // Pattern B:
    // public bool Gerceklik { get; set; }
    // public string? UygulananDenetimTeknikleri { get; set; }
}

public class {ModelAdi}KaydetDto
{
    public int DenetciId { get; set; }
    public int DenetlenenId { get; set; }
    public int Yil { get; set; }
    public List<{ModelAdi}SatirDto> Satirlar { get; set; } = new();
}
```

### 2e. Repository Interface

`FasWebAPI/Repository/Abstract/CalismaKagitlari/I{ModelAdi}Repository.cs`

```csharp
public interface I{ModelAdi}Repository
{
    Task<List<{ModelAdi}>> GetByDenetlenen(int denetciId, int denetlenenId, int yil);
    Task<bool> Kaydet({ModelAdi}KaydetDto dto);
    Task<bool> VarsayilanaDon(int denetciId, int denetlenenId, int yil);
}
```

### 2f. Repository Concrete — GetByDenetlenen

Şablon kopyalama pattern'i (standart → kullanıcı):

```csharp
public async Task<List<{ModelAdi}>> GetByDenetlenen(int denetciId, int denetlenenId, int yil)
{
    var existing = await _context.{ModelAdi}
        .Where(x => x.DenetciId == denetciId && x.DenetlenenId == denetlenenId && x.Yil == yil)
        .OrderBy(x => x.SatirNo)
        .ToListAsync();

    if (existing.Any()) return existing;

    // Şablondan kopyala
    var templates = await _context.{ModelAdi}
        .Where(x => x.DenetlenenId == null)
        .OrderBy(x => x.SatirNo)
        .ToListAsync();

    var copies = templates.Select(item => new {ModelAdi}
    {
        DenetciId = denetciId,
        DenetlenenId = denetlenenId,
        Yil = yil,
        Standartmi = false,
        Islem = item.Islem,
        Durum = item.Durum ?? "Evet",
        Tespit = item.Durum == "Hayır" ? item.HayirIcerik : item.EvetIcerik,
        // Tüm yeni alanları kopyala:
        SatirNo = item.SatirNo,
        Bolum = item.Bolum,
        EvetRiskSeviyesi = item.EvetRiskSeviyesi,
        EvetIcerik = item.EvetIcerik,
        EvetDenetimAksiyonu = item.EvetDenetimAksiyonu,
        HayirRiskSeviyesi = item.HayirRiskSeviyesi,
        HayirIcerik = item.HayirIcerik,
        HayirDenetimAksiyonu = item.HayirDenetimAksiyonu,
        IlgiliBds = item.IlgiliBds,
    }).ToList();

    await _context.{ModelAdi}.AddRangeAsync(copies);
    await _context.SaveChangesAsync();
    return copies;
}
```

### 2g. Repository Concrete — Kaydet (Bulk Update)

```csharp
public async Task<bool> Kaydet({ModelAdi}KaydetDto dto)
{
    var ids = dto.Satirlar.Select(s => s.Id).ToList();
    var records = await _context.{ModelAdi}
        .Where(x => ids.Contains(x.Id)
                 && x.DenetciId == dto.DenetciId
                 && x.DenetlenenId == dto.DenetlenenId
                 && x.Yil == dto.Yil)
        .ToListAsync();

    foreach (var satir in dto.Satirlar)
    {
        var record = records.FirstOrDefault(r => r.Id == satir.Id);
        if (record == null) continue;
        record.Durum = satir.Durum;
        record.Tespit = satir.Tespit;
    }

    await _context.SaveChangesAsync();
    return true;
}
```

### 2h. VarsayilanaDon (Repository)

```csharp
public async Task<bool> VarsayilanaDon(int denetciId, int denetlenenId, int yil)
{
    var records = await _context.{ModelAdi}
        .Where(x => x.DenetciId == denetciId && x.DenetlenenId == denetlenenId && x.Yil == yil)
        .ToListAsync();
    if (!records.Any()) return true;
    _context.{ModelAdi}.RemoveRange(records);
    await _context.SaveChangesAsync();
    return true;
}
```

### 2i. Service Interface

`FasWebAPI/Services/Abstract/CalismaKagitlari/I{ModelAdi}Service.cs`

```csharp
public interface I{ModelAdi}Service
{
    Task<List<{ModelAdi}>> GetByDenetlenen(int denetciId, int denetlenenId, int yil);
    Task<bool> Kaydet({ModelAdi}KaydetDto dto);
    Task<bool> VarsayilanaDon(int denetciId, int denetlenenId, int yil);
}
```

### 2j. Service Concrete

`FasWebAPI/Services/Concrete/CalismaKagitlari/{ModelAdi}Service.cs`

```csharp
public class {ModelAdi}Service : I{ModelAdi}Service
{
    private readonly I{ModelAdi}Repository _repository;

    public {ModelAdi}Service(I{ModelAdi}Repository repository)
        => _repository = repository;

    public Task<List<{ModelAdi}>> GetByDenetlenen(int denetciId, int denetlenenId, int yil)
        => _repository.GetByDenetlenen(denetciId, denetlenenId, yil);

    public Task<bool> Kaydet({ModelAdi}KaydetDto dto)
        => _repository.Kaydet(dto);

    public Task<bool> VarsayilanaDon(int denetciId, int denetlenenId, int yil)
        => _repository.VarsayilanaDon(denetciId, denetlenenId, yil);
}
```

### 2k. Controller

`FasWebAPI/Controllers/CalismaKagitlari/{ModelAdi}Controller.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
public class {ModelAdi}Controller : ControllerBase
{
    private readonly I{ModelAdi}Service _service;

    public {ModelAdi}Controller(I{ModelAdi}Service service)
        => _service = service;

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int denetciId,
        [FromQuery] int denetlenenId,
        [FromQuery] int yil)
    {
        var result = await _service.GetByDenetlenen(denetciId, denetlenenId, yil);
        return Ok(result);
    }

    [HttpPost("kaydet")]
    public async Task<IActionResult> Kaydet([FromBody] {ModelAdi}KaydetDto dto)
    {
        var ok = await _service.Kaydet(dto);
        return ok ? Ok() : BadRequest();
    }

    [HttpDelete]
    public async Task<IActionResult> VarsayilanaDon(
        [FromQuery] int denetciId,
        [FromQuery] int denetlenenId,
        [FromQuery] int yil)
    {
        var ok = await _service.VarsayilanaDon(denetciId, denetlenenId, yil);
        return ok ? Ok() : BadRequest();
    }
}
```

### 2l. Controller Endpoints Özeti

```
GET  /api/{ModelAdi}?denetciId=&yil=&denetlenenId=
POST /api/{ModelAdi}/kaydet
DELETE /api/{ModelAdi}?denetciId=&yil=&denetlenenId=   (varsayılana dön)
```

DELETE endpoint body'si → `GetByDenetlenen`'e ait satırları sil, sonraki GET şablondan yeniden oluşturur.

---

## BÖLÜM 3 — Frontend

### 3a. API Dosyası

`FasWebUI/src/api/CalismaKagitlari/{ModelAdi}.ts`

```typescript
import { apiFetch } from "@/api/apiBase";

export interface {ModelAdi}Row {
  id: number;
  satirNo: number | null;
  islem: string | null;
  durum: string;
  tespit: string | null;
  evetRiskSeviyesi: string | null;
  evetIcerik: string | null;
  evetDenetimAksiyonu: string | null;
  hayirRiskSeviyesi: string | null;
  hayirIcerik: string | null;
  hayirDenetimAksiyonu: string | null;
  ilgiliBds: string | null;
  standartmi: boolean | null;
  // konu / bolum varsa ekle
}

export const get{ModelAdi}ByDenetlenen = async (
  denetciId: number, denetlenenId: number, yil: number
): Promise<{ModelAdi}Row[]> => {
  try {
    const res = await apiFetch(
      `/{ModelAdi}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      { method: "GET", headers: { accept: "application/json" } }
    );
    if (res.ok) return res.json();
    return [];
  } catch { return []; }
};

export const kaydet{ModelAdi} = async (dto: {ModelAdi}KaydetDto): Promise<boolean> => {
  try {
    const res = await apiFetch(`/{ModelAdi}/kaydet`, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    return res.ok;
  } catch { return false; }
};

export const varsayilanaDon{ModelAdi} = async (
  denetciId: number, denetlenenId: number, yil: number
): Promise<boolean> => {
  try {
    const res = await apiFetch(
      `/{ModelAdi}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      { method: "DELETE", headers: { accept: "application/json" } }
    );
    return res.ok;
  } catch { return false; }
};
```

### 3b. Table Bileşeni

`FasWebUI/src/app/(Uygulama)/components/CalismaKagitlari/{ModelAdi}Table.tsx`

**Zorunlu import'lar:**
```typescript
import IslemlerCardHtml from ".../Cards/IslemlerCardHtml";
import BelgeKontrolCard from ".../Cards/BelgeKontrolCard";
// NOT: IslemlerCard kullanma — her zaman IslemlerCardHtml kullan
```

**Risk chip için yardımcı fonksiyonlar:**
```typescript
type MuiChipColor = "error" | "warning" | "info" | "success" | "default";

function getRiskColor(seviye: string | null): MuiChipColor {
  if (!seviye) return "default";
  const map: Record<string, MuiChipColor> = {
    Kritik: "error", Yüksek: "warning", Orta: "info", Düşük: "success",
  };
  return map[seviye] ?? "default";
}

function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function riskChipClass(seviye: string | null): string {
  if (!seviye) return "";
  const s = seviye.toUpperCase();
  if (s.includes("KRİT") || s.includes("KRIT")) return "chip chip-error";
  if (s.includes("YÜKS") || s.includes("YUKS")) return "chip chip-warn";
  if (s === "ORTA") return "chip chip-info";
  if (s.includes("DÜŞÜ") || s.includes("DUSU")) return "chip chip-ok";
  return "chip";
}
```

**Renk kuralları (MUI Chip):**
- `variant="outlined"` + `color={getRiskColor(seviye)}` — sadece bu kombinasyonu kullan
- Tablo başlıkları: `bgcolor: "grey.100"` (primary.main kullanma)
- Bölüm başlıkları: `bgcolor: "grey.50"`, `color: "text.secondary"`, `border: 1px solid divider`
- Detay panel etiketleri: `color="text.secondary"` (primary/error kullanma)
- Radio butonları: renksiz (color prop ekleme)

**Props pattern:**
```typescript
interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (n: number) => void;
  setToplam: (n: number) => void;
}
```

**readOnly kontrolü:**
```typescript
const isReadOnly = user.rol?.includes("KaliteKontrol") || user.rol?.includes("SorumluDenetci");
```

**JSX sonu (her zaman bu sırada):**
```tsx
{/* Kaydet butonu */}
{!isReadOnly && (
  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
    <Button variant="contained" color="primary" onClick={handleKaydet} disabled={saving}>
      {saving ? "Kaydediliyor..." : "Kaydet"}
    </Button>
  </Box>
)}

<BelgeKontrolCard controller="{ModelAdi}" />
<IslemlerCardHtml controller="{ModelAdi}" buildHtmlAsync={buildHtmlAsync} />
```

### 3c. buildHtmlAsync — HTML Şablonu

**Sayfa yönü seçimi:**
| Tablo genişliği | `@page` yönü |
|-----------------|--------------|
| ≤ 6 sütun (soru metinli) | `size: A4;` — dikey |
| ≥ 7 sütun veya boolean'lı geniş | `size: A4 landscape;` — yatay |

**Temel HTML yapısı (her sayfada aynı):**

```typescript
const buildHtmlAsync = async () => {
  const createdAt = new Date().toLocaleString("tr-TR");

  // Satırları HTML'e dönüştür (localChanges'ı kullan)
  const tableRows = rows.map((row, idx) => {
    const ch = localChanges[row.id] ?? { durum: row.durum ?? "Evet", tespit: "" };
    const isEvet = ch.durum === "Evet";
    const riskSeviye = isEvet ? row.evetRiskSeviyesi : row.hayirRiskSeviyesi;
    return `
      <tr>
        <td>${escapeHtml(String(row.satirNo ?? idx + 1))}</td>
        <td>${escapeHtml(row.islem)}</td>
        <td>${escapeHtml(ch.durum)}</td>
        <td><span class="${riskChipClass(riskSeviye)}">${escapeHtml(riskSeviye ?? "—")}</span></td>
        <td>${escapeHtml(ch.tespit)}</td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>{BELGE BAŞLIĞI}</title>
  <style>
    @page { size: A4 [portrait|landscape]; margin: 2cm 1.5cm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: Arial, sans-serif; font-size: 10px; color: #1a202c; }
    .doc-header { border-bottom: 2px solid #2b6cb0; padding-bottom: 12px; margin-bottom: 16px; }
    .doc-title { font-size: 14px; font-weight: 700; color: #2b6cb0; text-transform: uppercase; }
    .doc-meta { font-size: 10px; color: #555; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #f1f5f9; font-weight: 700; border: 1px solid #cbd5e0; padding: 5px 6px; text-align: left; }
    td { border: 1px solid #e2e8f0; padding: 4px 6px; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }
    .group-header td { background: #f8f9fa !important; font-weight: 700; }
    .chip { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; border: 1px solid; }
    .chip-error { background:#fdf2f2; color:#b91c1c; border-color:#fca5a5; }
    .chip-warn  { background:#fffbeb; color:#b45309; border-color:#fcd34d; }
    .chip-info  { background:#eff6ff; color:#1d4ed8; border-color:#93c5fd; }
    .chip-ok    { background:#f0fdf4; color:#15803d; border-color:#86efac; }
    .doc-footer { margin-top: 24px; font-size: 9px; color: #999; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="doc-header">
    <div class="doc-title">{BELGE BAŞLIĞI}</div>
    <div class="doc-meta">Denetlenen: ${escapeHtml(user.denetlenenFirmaAdi)} &nbsp;|&nbsp; Yıl: ${escapeHtml(String(user.yil ?? ""))}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:5%;">No</th>
        <th style="width:40%;">Kontrol Sorusu</th>
        <th style="width:12%;">Yanıt</th>
        <th style="width:15%;">Risk Seviyesi</th>
        <th style="width:28%;">Tespit / Açıklama</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="doc-footer">
    <span>FAS Denetim Sistemi</span>
    <span>Oluşturulma: ${escapeHtml(createdAt)}</span>
  </div>
</body>
</html>`;
};
```

**Gruplu tablo için** (grup başlığı satırı ekle):
```typescript
const groupRowsHtml = Object.entries(groups).map(([konu, groupRows]) => {
  const items = groupRows.map((row, idx) => `<tr>...</tr>`).join("");
  return `<tr class="group-header"><td colspan="5">${escapeHtml(konu)}</td></tr>${items}`;
}).join("");
```

### 3d. Page.tsx

`FasWebUI/src/app/(Uygulama)/PlanVeProgram/{ModelAdi}/page.tsx`

Minimal page — sadece state tut, tablo bileşenine geç:

```typescript
const Page = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);
  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const controller = "{ModelAdi}";
  // ...
  return (
    <>
      <Breadcrumb ...>
        {/* Desktop: EkBelgeYukleButton + VarsayilanaDon butonu */}
        {/* Mobile: IconButton + Menu dropdown */}
      </Breadcrumb>
      <PageContainer ...>
        <{ModelAdi}Table
          isClickedVarsayilanaDon={isClickedVarsayilanaDon}
          setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
          setTamamlanan={setTamamlanan}
          setToplam={setToplam}
        />
      </PageContainer>
    </>
  );
};
```

### 3e. MenuItems.ts Kaydı

`FasWebUI/src/app/(Uygulama)/components/Layout/Vertical/Sidebar/MenuItems.ts`

`PlanVeProgram` bölümüne ekle:
```typescript
{
  id: "{modelAdi}",
  title: "{Görünen Başlık}",
  type: "item",
  url: "/PlanVeProgram/{ModelAdi}",
  icon: IconFileText,  // uygun icon seç
},
```

---

## BÖLÜM 4 — Migration Uygulama

### Adım 1: Migration dosyasını doğru yaz

Migration dosyasında **şema dışında veri (seed UPDATE) olmamalıdır** — SQL syntax hatasına yol açar.  
Sadece `AddColumn` / `DropColumn` kullan. Seed veriyi uygulama içinden yönet.

Migration dosyası başına mutlaka `[DbContext]` ve `[Migration]` attribute'ları ekle:

```csharp
using FasWebApi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260410160000_AddOrnek")]
public partial class AddOrnek : Migration { ... }
```

> **Dikkat:** Bu attribute'lar olmadan EF Core migration'ı tanımaz — `migrations list`'te görünmez ve uygulanmaz.  
> `dotnet ef migrations add` ile oluşturulan dosyalar `.Designer.cs` dosyasına koyar; manuel yazılan dosyalarda direkt class'a eklenmeli.

### Adım 2: API'yi durdur

API çalışırken `FasWebApi.exe` kilitlidir — build yapılamaz. Visual Studio veya Task Manager'dan API'yi durdur.

### Adım 3: Dev DB'ye uygula

```bash
cd FasWebAPI
ASPNETCORE_ENVIRONMENT=Development dotnet ef database update --context AppDbContext
```

### Adım 4: Prod DB'ye uygula

Prod ortamı `TokenOptions:SecurityKey` gibi eksik config nedeniyle başlatılamaz.  
`--connection` flag'i kullanarak Dev ortamıyla Prod DB'ye bağlan:

```bash
ASPNETCORE_ENVIRONMENT=Development \
  dotnet ef database update \
  --context AppDbContext \
  --no-build \
  --connection "Server=10.10.76.4;Port=3306;Database=FASDB;User=fasdbuserN2adm;Password=...;"
```

### Sorun Giderme

| Hata | Neden | Çözüm |
|------|-------|-------|
| `Build failed — file locked` | API çalışıyor, exe kilitli | API'yi durdur, sonra migrate et |
| Migration `migrations list`'te görünmüyor | `[DbContext]` / `[Migration]` attribute eksik | Attribute'ları ekle |
| `Duplicate column name` | Migration başarısız oldu ama DDL auto-commit ile kolonlar eklendi | Migration'ı `IF NOT EXISTS` SQL'e dönüştür: `migrationBuilder.Sql("ALTER TABLE \`T\` ADD COLUMN IF NOT EXISTS \`Col\` INT NULL;")` |
| `--no-build` ile "Done." ama migration uygulanmadı | Binary eski, migration sınıfı derlenmiş binary'de yok | API'yi durdur, `--no-build` olmadan çalıştır |
| Prod için `Unable to create DbContext` | Prod environment tüm config'i gerektirir | `ASPNETCORE_ENVIRONMENT=Development --connection "..."` kullan |

**Önemli:** `--environment` flag'i çalışmaz, `ASPNETCORE_ENVIRONMENT` env variable kullan.

---

## BÖLÜM 5 — Kontrol Listesi

Her yeni sayfa tamamlandığında işaretle:

- [ ] Excel okundu, seed satırları belirlendi
- [ ] Entity'e yeni alanlar eklendi
- [ ] Configuration'a kolon tipleri eklendi
- [ ] Migration oluşturuldu (AddColumn — seed veri YOK, `[DbContext]` + `[Migration]` attribute'ları var)
- [ ] DTO (KaydetDto + SatirDto) oluşturuldu
- [ ] Repository: GetByDenetlenen (şablondan kopyalama) eklendi
- [ ] Repository: Kaydet (bulk update) eklendi
- [ ] Service ve Controller güncellendi
- [ ] Frontend API dosyası (`/api/CalismaKagitlari/{ModelAdi}.ts`)
- [ ] Table bileşeni (`IslemlerCardHtml` + `buildHtmlAsync` dahil)
- [ ] Page.tsx (Breadcrumb + mobile/desktop layout)
- [ ] MenuItems.ts'e eklendi
- [ ] Dev DB'ye migration uygulandı
- [ ] Prod DB'ye migration uygulandı

---

## Mevcut Sayfalar (Referans)

| Sayfa | Controller | Pattern | PDF Yönü |
|-------|------------|---------|----------|
| BilgiIslemMuhasebe | `BilgiIslemMuhasebe` | Evet/Hayır + risk chip | Dikey |
| TespitEdilenRiskler | `TespitEdilenRiskler` | 6 boolean + collapsible | **Yatay** |
| IsletmeyeIliskinIcKontrolTespit | `IsletmeyeIliskinIcKontrolTespit` | Evet/Hayır + gruplu | Dikey |

---

## Sık Yapılan Hatalar

| Hata | Çözüm |
|------|-------|
| `IslemlerCard` import edilmiş | Her zaman `IslemlerCardHtml` kullan |
| Chip `color="error"` filled kullanılmış | `variant="outlined" color={getRiskColor(...)}` kullan |
| Tablo başlığı `bgcolor: "primary.main"` | `bgcolor: "grey.100"` kullan |
| Migration `--environment Development` hatası | `ASPNETCORE_ENVIRONMENT=Development` env var kullan |
| Prod DB erişim reddedildi | `--connection` flag ile dev environment + prod connection string |
| Türkçe karakter SQL'de bozuk | Python `sql_escape()` ile `'` → `''` dönüştür |
| `buildHtmlAsync` eksik | `IslemlerCardHtml` prop'u boş kalınca önizleme çalışmaz |
