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
