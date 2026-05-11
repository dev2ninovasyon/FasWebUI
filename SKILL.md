---
name: faswebui-standards
description: Use this skill when editing FasWebUI pages, auth flows, forms, menus, and user-facing copy. Apply Turkish text quality, project-consistent MUI layout decisions, compact UI behavior, and polished page structure.
---

# FasWebUI Standards

## Overview

Use these standards for user-facing work in `FasWebUI`. Keep the interface clean, Turkish-first, visually aligned with the existing application, and practical in real use.

## When To Use

Use this skill when editing:

- files under `src/app`, `src/components`, `src/services`, or other user-facing UI layers
- auth pages such as login, forgot-password, and reset-password
- visible labels, headings, helper texts, alerts, tabs, browser titles, and button texts
- layouts, cards, buttons, forms, preview panels, or pages the user wants to look "uygulamaya uygun"

## Turkish Text Rules

- Always use correct Turkish characters in visible text: `Ş, ş, İ, ı, Ğ, ğ, Ü, ü, Ö, ö, Ç, ç`.
- Fix broken encodings proactively. Replace strings such as `Sifre`, `Giris`, `Baglanti`, `Kalem AdÄ±`, `Ã`, `Å`.
- Prefer natural Turkish sentences over literal or awkward wording.
- If the page is Turkish, keep titles, helper texts, and action labels Turkish too.

## UI And Layout Rules

- Match the existing `FasWebUI` visual language instead of adding a new design system.
- **Font & Stil Kuralı:** Projede hiçbir şekilde farklı font (font-family) ve manuel yazı stili (fontStyle, uçuk renkli kalın punto vb.) override kullanma. Her zaman standart Material UI tabloları (`Table`, `TableCell`) ve tema varsayılanı font yazı tiplerini diğer sayfalarla aynı olacak şekilde referans al. Özellikle `Handsontable` gibi farklı rendering motorları gerektiren özel UI parçalarından kaçın.
- **Handsontable Tema Kuralı:** Handsontable seçim alanları, aktif hücre/başlık vurguları, autofill tutamaçları, checkbox/radio durumları ve filtre menüsü aksanları her zaman aktif MUI temasının `theme.palette.primary` renklerinden beslenmelidir. Sayfa veya renderer içinde sabit turuncu/mavi/yeşil renk kullanma; gerekirse global `src/app/AppProviders.tsx` içindeki `[class*="ht-theme-horizon"]` CSS değişkenlerini genişlet.
- Prefer the project's MUI-based cards, spacing, inputs, and buttons over raw HTML-looking controls.
- Keep pages compact and balanced. Avoid oversized info blocks that push the main form too far down.
- Do not add duplicate headings or redundant hero sections when the screen is already clear.
- If content editing and preview are both important, prefer side-by-side layouts on wide screens.

## Form Behavior

- Form help should support the task without breaking page flow.
- Password criteria and similar guidance should not expand the whole page unnecessarily.
- Prefer compact overlays, popovers, or anchored helper panels when they prevent layout shift.
- When the user wants simplification, remove secondary controls and keep the flow focused.

## Button And Action Rules

- Use primary and secondary button hierarchy consistent with the project theme.
- Avoid mismatched button styles, default browser buttons, or cluttered toolbars.
- Keep action labels short, clear, and in correct Turkish.

## Working Style

- Before editing a screen, inspect nearby pages and follow the same component and spacing pattern.
- When fixing one broken label, scan the whole user flow for related Turkish issues.
- If a route still shows the old UI, trace the actual page file and active render path before making more changes.

---

# Prod DB Migration (EF Core + MySQL + PowerShell)

## Kural: Prod DB güncelle denildiğinde bu adımları uygula

### Sorun
PowerShell double-quote (`"`) içinde `$` işareti **değişken olarak expand edilir**.  
Şifre içinde `$` varsa (örn. `N2FAS_2026_!9Kx#47Lm$82Qp@61Rt%73Vb.`) → şifre bozulur → `Access denied`.

### Doğru Yöntem: Environment Variable

```powershell
# 1. Single-quote ile env var set et ($ expand edilmez)
$env:PROD_CONN = 'Server=10.10.76.4;Port=3306;Database=FASDB;User=fasdbuserN2adm;Password=N2FAS_2026_!9Kx#47Lm$82Qp@61Rt%73Vb.;AllowLoadLocalInfile=true;MaximumPoolSize=40;MinimumPoolSize=5;ConnectionIdleTimeout=120;ConnectionReset=true;DefaultCommandTimeout=300;'

# 2. Env var'ı --connection argümanı olarak geç
cd "c:\Users\lenov\source\repos\dev2ninovasyon\FasWebAPI"
dotnet ef database update --project FasWebApi.csproj --context AppDbContext --connection $env:PROD_CONN
```

### Neden Çalışır
- `'...'` single-quote: PowerShell hiç expand etmez, şifre aynen gider.
- `"..."` double-quote: `$82Qp` → boş string → şifre kırılır → Access denied.

### Prod Bilgileri
- **Server:** `10.10.76.4:3306`
- **Database:** `FASDB`
- **User:** `fasdbuserN2adm`
- **Bu makinenin IP'si:** `10.20.76.2` (MySQL grant bu IP için gereklidir)
- **Context:** `AppDbContext`
- **Project:** `FasWebApi.csproj`

### Erişim Sorunu Yaşanırsa
MySQL sunucusunda (root ile) şunu çalıştır:
```sql
GRANT ALL PRIVILEGES ON FASDB.* TO 'fasdbuserN2adm'@'10.20.76.2' IDENTIFIED BY '...şifre...';
FLUSH PRIVILEGES;
-- Doğrula:
SHOW GRANTS FOR 'fasdbuserN2adm'@'10.20.76.2';
```

### Port Erişim Testi
```powershell
Test-NetConnection -ComputerName 10.10.76.4 -Port 3306
```

### Migration Başarısız Olursa: SQL Script Alternatifi
```powershell
dotnet ef migrations script --context AppDbContext --output "c:\tmp\prod_migration.sql" --idempotent
# Sonra script'i prod sunucuda MySQL admin ile çalıştır
```

---

# Handsontable Speech-to-Text Integration

## Overview

The `SpeechTextEditor` is a reusable Handsontable custom editor with built-in speech-to-text capability. Use this pattern for any table that requires text input with voice support across the application.

**File Location:** `src/components/CalismaKagitiHotTable/SpeechTextEditor.ts`

## Key Features

- ✅ **Speech Recognition:** Real-time voice-to-text conversion with Turkish language support
- ✅ **Fallback Polling:** Automatic 5-second polling if WebSocket/SignalR unavailable
- ✅ **Custom Editor:** Extends Handsontable TextEditor with mic button in bottom-right corner
- ✅ **Status Indicator:** Shows "Dinliyor" badge when recording active
- ✅ **Memory Safe:** Proper cleanup on editor close, no DOM leaks
- ✅ **Pure DOM:** No React/MUI dependencies, works inside HOT cell editor
- ✅ **Event Prevention:** Protects textarea from accidental close when clicking mic

## When To Use

Use `SpeechTextEditor` when:
- Table column contains text that users need to enter frequently (e.g., notes, findings, descriptions)
- Users prefer voice input over typing (accessibility, speed)
- Page requires Handsontable with cell-level editing (`afterChange` hooks)

Do NOT use if:
- Page uses standard MUI inputs (use browser speech API directly instead)
- Table is read-only or display-only
- Column is dropdown, date, or number type (use specialized editors)

## Implementation Steps

### 1. Import the Editor

```typescript
import { SpeechTextEditor } from "@/components/CalismaKagitiHotTable/SpeechTextEditor";
```

### 2. Configure Handsontable Column

```typescript
const columns = [
  { data: "id", type: "numeric", readOnly: true },
  { data: "bulgu", type: "text", editor: SpeechTextEditor }, // Speech-enabled column
  { data: "durum", type: "dropdown", source: ["Evet", "Hayır"] },
];
```

### 3. Styling & Layout

**Handsontable Container:**
```typescript
const hotSettings = {
  data: tableData,
  columns: columns,
  rowHeaders: true,
  colHeaders: true,
  stretchH: "all",
  height: "auto",
  licenseKey: "non-commercial-and-evaluation",
};
```

**Textarea Styling (inside editor):**
- Margin: 0, Padding: 4px
- Font: inherit (uses page default font)
- Border: 1px solid #ddd
- Min-height: auto (expands with content)

### 4. Event Handlers

Listen to `afterChange` event to track user input:

```typescript
const handleAfterChange = (changes: any[][], source: string) => {
  if (source === "edit" || source === "CopyPaste.paste") {
    changes?.forEach(([row, col, oldValue, newValue]) => {
      if (newValue !== oldValue) {
        // Row changed - save to state/API
        console.log(`Row ${row}: ${newValue}`);
      }
    });
  }
};
```

## Custom Renderers

### Template Placeholder Renderer

File: `src/components/CalismaKagitiHotTable/renderers.ts`

Use `tespitRenderer` to show template content as light gray placeholder when cell is empty:

```typescript
import { tespitRenderer } from "@/components/CalismaKagitiHotTable/renderers";

const columns = [
  {
    data: "tespit",
    type: "text",
    renderer: tespitRenderer,  // Shows template content when empty
    editor: SpeechTextEditor,
  },
];
```

**Renderer Logic:**
- If cell value is empty OR contains old template text: display template in gray italic
- Otherwise: display user-entered text in normal style
- Helps users understand what field should contain

### Duration Formatter Renderer

```typescript
const durationRenderer: Handsontable.renderers.Renderer = (
  instance,
  td,
  row,
  col,
  prop,
  value,
  cellProperties
) => {
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  td.textContent = `${hours}h ${minutes}m`;
};
```

## Speech Recognition Configuration

**RecognitionManager** (singleton):
- Ensures only one active speech session application-wide
- Auto-stops previous recording if user starts new one
- Prevents "already recording" errors

**Language:** Turkish (`tr-TR`)
**Fallback:** 5-second polling interval when SpeechRecognition unavailable

## Styling Standards

### Mic Button (Default State)
- Size: 22px × 22px circle
- Background: `rgba(255,255,255,0.9)` with backdrop blur
- Color: `#555` (dark gray icon)
- Border-radius: 50%
- Cursor: pointer
- Transition: 0.15s ease for color/background changes

### Mic Button (Recording State)
- Background: `rgba(211,47,47,0.12)` (light red)
- Color: `#d32f2f` (red icon)
- Status badge: "Dinliyor" text in red, positioned left of icon

### Status Indicator
- Position: Absolute, left of mic button (`left: -50px`, vertically centered)
- Font: 9px bold, red (`#d32f2f`)
- Background: `rgba(255,255,255,0.9)` with 2px border-radius
- Padding: 1px 3px
- Display: hidden by default, shown when recording

## Editor Lifecycle

### `open()` - Initialization
1. Get TEXTAREA_PARENT and TEXTAREA references
2. Set `overflow: visible` on parent (allow button visibility)
3. Add 30px right padding to textarea (prevent text overlap with button)
4. Inject mic button wrapper into parent

### `close()` - Cleanup
1. Stop any active speech recognition
2. Remove mic button wrapper from DOM
3. Restore parent overflow and textarea padding to original values
4. Call parent `close()`

### Focus Management
- Mic button: `tabindex="-1"` (not focusable via Tab key)
- `mousedown` event: Prevent event default + stop propagation
- After mousedown: Use `requestAnimationFrame` to restore textarea focus
- Prevents Handsontable from interpreting button click as "close editor"

## Performance Notes

- **Memory:** Editor cleaned up on every close; no lingering DOM nodes
- **Speech API:** Uses native browser Web Speech API (no external API calls)
- **Polling Fallback:** 5-second intervals consume minimal bandwidth
- **Rendering:** Handsontable caches renderers; no re-render penalty

## Example: Complete Page Implementation

```typescript
import { SpeechTextEditor } from "@/components/CalismaKagitiHotTable/SpeechTextEditor";
import { tespitRenderer } from "@/components/CalismaKagitiHotTable/renderers";
import { HotTable } from "@handsontable/react";

export function AuditTablePage() {
  const [tableData, setTableData] = useState([]);

  const columns = [
    { data: "id", type: "numeric", readOnly: true, width: 60 },
    { data: "aciklama", type: "text", width: 200 },
    {
      data: "bulgu",
      type: "text",
      width: 300,
      renderer: tespitRenderer,
      editor: SpeechTextEditor,
    },
    { data: "sonuc", type: "dropdown", source: ["Kabul", "Red", "Askıda"] },
  ];

  const handleSave = async (changes: any[][]) => {
    const payload = changes.map(([row, col, oldVal, newVal]) => ({
      id: tableData[row].id,
      field: columns[col].data,
      value: newVal,
    }));
    await saveAuditTable(payload);
  };

  return (
    <div>
      <HotTable
        data={tableData}
        columns={columns}
        rowHeaders={true}
        colHeaders={true}
        stretchH="all"
        height="auto"
        afterChange={(changes, source) => {
          if (source === "edit") handleSave(changes || []);
        }}
      />
    </div>
  );
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Mic button not visible | Check `overflow: visible` is set on TEXTAREA_PARENT |
| Can't type in cell after clicking mic | Ensure `pointerEvents: auto` on mic button |
| "Dinliyor" text overlaps icon | Verify `left: -50px` positioning on status indicator |
| Speech recognition not starting | Check browser supports Web Speech API; test in Chrome/Edge |
| Old text persists in template placeholder | Clear template metadata or run `refresh()` on table |

## API Reference

### SpeechTextEditor Methods (Internal)

| Method | Purpose |
|--------|---------|
| `open()` | Initialize editor and inject mic button |
| `close()` | Cleanup and remove mic button |
| `focus()` | Focus textarea (not mic button) |
| `_toggleRecognition()` | Start/stop speech recording |
| `_updateMicUI(recording: boolean)` | Update button color and status badge |
| `_injectMicButton()` | Create and append mic button to DOM |
| `_removeMicButton()` | Remove mic button and restore styles |

### Editor Properties

| Property | Type | Purpose |
|----------|------|---------|
| `_micBtn` | HTMLButtonElement \| null | Mic button DOM element |
| `_micWrapper` | HTMLDivElement \| null | Wrapper container for button and status |
| `_statusIndicator` | HTMLSpanElement \| null | "Dinliyor" status text |
| `_recording` | boolean | Current recording state |
| `_recognition` | SpeechRecognitionInstance \| null | Browser speech API instance |
| `_anchor` | string | Text value before recording started |
