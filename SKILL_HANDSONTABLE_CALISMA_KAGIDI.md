---
name: fas-handsontable-calisma-kagidi
description: Use this skill when building or updating a FasWebUI calisma kagidi page that uses Handsontable. Apply the same structure, drawer editing flow, AI tools, speech integration, save flow, and page composition used by the current BilgiIslemMuhasebe and IsletmeyeIliskinIcKontrolTespit working papers.
---

# FAS Handsontable Calisma Kagidi

## When To Use

Use this skill when the task involves:

- a new `FasWebUI` calisma kagidi page built with `CalismaKagitiHotTable`
- making one calisma kagidi behave like another existing Handsontable page
- adding or fixing the row edit drawer on a calisma kagidi page
- adding speech editor integration, AI tools, save flow, preview flow, or dirty-state protection
- requests like "bu calisma kagidi diger sayfadaki gibi olsun", "handsontable ile yeni calisma kagidi yap", or "satir duzenleme panelini ayni yap"

## Primary Reference

Read these files first and mirror them before inventing anything:

- `src/app/(Uygulama)/components/CalismaKagitlari/BilgiIslemMuhasebeTableHandson.tsx`
- `src/app/(Uygulama)/components/CalismaKagitlari/IsletmeyeIliskinIcKontrolTespitTable.tsx`
- `src/components/CalismaKagitiHotTable/SpeechTextEditor.ts`
- `src/components/CalismaKagitiHotTable/index.tsx`

If the user says one page should match another, treat the currently approved page as the source of truth and copy its interaction model closely.

## Required Page Shape

For a full calisma kagidi page, prefer this structure:

1. top-right save button
2. bordered `CalismaKagitiHotTable` container
3. `FormOnayBolumu`
4. `IslemlerCardHtml`
5. unsaved-changes navigation guard
6. row edit drawer opened from `SpeechTextEditor`

Do not add extra hero sections, oversized intros, or decorative wrappers.

## Handsontable Standard

Use `CalismaKagitiHotTable`, not raw Handsontable setup, unless the user explicitly asks otherwise.

Follow these conventions:

- keep table data in `tableDataRef`
- track modified rows in `changedRowIdsRef`
- track unsaved state with `isHotDirty`
- use `stretchH="last"` when the final text column should grow
- use `HOT_BASE_ROW_HEIGHT` and the same shell classes when matching the newer pages
- use `setEditorPanelOpener` from `SpeechTextEditor` for drawer opening
- keep `afterChange` responsible for dirty tracking and template propagation
- if the page has template-driven `durum` logic, preserve it

## Row Edit Drawer Standard

When a calisma kagidi has the approved drawer pattern, match this behavior:

- right-side `Drawer`
- title: `Satır Düzenleme Paneli`
- subtitle explaining that changes are applied to the table first and saved permanently with the page save button
- tabbed editing for `Soru`, `Açıklama`, and `BDS Ref.` when the page has those fields
- one active field at a time
- speech-to-text button per active field
- AI tools area opened from the sparkle button
- AI options:
  - `Zenginleştir`
  - `Özetle`
  - `Detaylandır`
- do not add a `Düzelt` button unless the user explicitly requests it
- footer actions:
  - `Kapat`
  - `Tabloya Uygula`

Match the working visual style too:

- drawer width around `{ xs: "100%", sm: 520, lg: 620 }`
- compact header with divider
- tab row directly below header
- light gray speech toolbar
- `primary.50` AI panel
- small circular icon buttons for AI and microphone

## Speech Integration Standard

When the drawer supports speech input:

- use browser `SpeechRecognition` / `webkitSpeechRecognition`
- record against the currently active drawer field
- keep a field-specific anchor string so partial transcripts append correctly
- show `Dinliyor` state only for the active field
- stopping recording must clean up listeners and refs

## AI Integration Standard

When using the approved AI flow:

- keep prompts in a local `AI_PROMPTS` array
- use `enhanceText(...)`
- require non-empty current text before sending
- show loading state in the drawer
- let the user preview AI output before applying it
- `Kullan` should write back only into the currently active drawer field
- clear stale AI result when changing tabs or closing the drawer

## Save And Navigation Standard

Preserve these behaviors:

- save only changed rows when possible
- after successful save, clear dirty tracking
- show success/error feedback with the page's existing snackbar pattern
- warn before leaving the page with unsaved changes
- if the page supports "varsayilana don", preserve that flow

## HTML / Approval Standard

When the page is a full calisma kagidi screen, keep:

- `FormOnayBolumu`
- `IslemlerCardHtml`
- export HTML aligned with visible table columns
- Turkish labels and proper Turkish characters

## Validation Checklist

Before finishing, verify:

- drawer opens from a table cell through `SpeechTextEditor`
- tabs switch correctly
- AI panel opens and uses only the approved buttons
- `Düzelt` is absent unless requested
- speech button starts and stops safely
- `Tabloya Uygula` writes back into the table
- save button persists data after drawer changes
- unsaved-change warning still works
- visible Turkish text is not mojibake

## Working Style

- do not redesign the calisma kagidi from scratch
- copy approved interaction patterns from the reference page first
- preserve project-specific naming such as `FormOnayBolumu`, `IslemlerCardHtml`, `CalismaKagitiHotTable`
- when matching two pages, prefer behavior parity over local improvisation
- if one page is declared "dogru olan", use that page as the source of truth
