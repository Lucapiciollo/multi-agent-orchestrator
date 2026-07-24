# Dark Mode Audit Report — TimeVision

## Summary

- **Project:** TimeVision (Angular 19 / Ionic 7 / Angular Material 19)
- **Date:** 2026-07-08
- **Branch:** n/a (audit read-only)
- **Result:** ⚠️ PARTIAL — Dark mode infrastructure exists but is based on `darkreader` (automated inversion), not on a native Fluent UI token system. Significant gaps found.

---

## Theme Strategy — Current State

| Aspect | Current | Required (Fluent UI standard) |
|---|---|---|
| Runtime selector | `darkreader` JS library (DOM injection) | `html[data-theme='dark']` or `:root.dark-mode` with CSS vars |
| CSS variables | Partial — custom vars in `_light.scss` / `_dark.scss` | Full Fluent UI token map in `:root` / `html[data-theme='dark']` |
| SCSS tokens | Partial — `_variables.scss` with brand colors | Fluent UI `--pl-*` token set mandatory |
| Angular Material integration | `m2-define-light-theme` only — **no dark theme defined** | `mat.m2-define-dark-theme` + `OverlayContainer` support |
| Tenant-ready | ❌ No | Recommended via `--pl-accent` override |
| Icon / SVG theming | ❌ Delegated to darkreader heuristics | CSS `var(--pl-icon-fg)` / `fill: currentColor` mandatory |

### Theme switching mechanism — CRITICAL FINDING

> **`ThemeService` uses `darkreader` v4.9.105** — an automated DOM-level color inversion library.
> This is not a native token-based dark mode. It works by heuristically rewriting computed CSS at runtime.
>
> **Consequences:**
> - No CSS custom properties are swapped at theme switch
> - Angular Material overlays (dialogs, select panels, tooltips, snackbars) may invert incorrectly
> - SVG assets with hardcoded fills are selectively excluded via `IGNORE_INLINE_STYLE_SELECTORS`
> - The `.dark-mode` class in `_dark.scss` is **never applied by `ThemeService`** — it is dead code
> - No `localStorage` persistence of theme preference
> - `isUserUsingDarkMode()` exists but `addListener` uses deprecated API

---

## Project Structure

```
src/
  global.scss              ← Angular Material theme setup (m2 light only)
  styles/
    main.scss              ← 7-1 SCSS architecture entry point
    themes/
      _light.scss          ← CSS custom properties (partial, app-specific vars)
      _dark.scss           ← .dark-mode class overrides (UNUSED by ThemeService)
      _material.scss       ← Material component overrides
      _ionic.scss          ← Ionic variable overrides
    abstracts/
      _variables.scss      ← SCSS compile-time variables (hardcoded hex)
    components/
      _forms.scss, _status.scss, _buttons.scss, ...
    layout/
      _table.scss, _grid.scss
  app/
    app.component.html     ← app-v1 / app-v2 dual layout (NgModule)
    cloud/agic/core/service/theme.service.ts  ← darkreader wrapper
```

**Architecture:** Angular 19, NgModule, dual UI version (`app-v1` = old, `app-v2` = new design).

---

## Angular Material Configuration

| Item | Value |
|---|---|
| Version | `@angular/material ^19.2.19` |
| M2 or M3 | **M2** (`mat.m2-define-light-theme`, `mat.m2-define-typography-config`) |
| Primary palette | `mat.$m2-blue-gray-palette` |
| Accent palette | `mat.$m2-blue-gray-palette` |
| Dark theme | ❌ **Not defined** |
| Overlay theme class | ❌ **Not configured** |
| Density | `-3` (compact) |
| Scoped themes | `app-v1` → blue-gray / `app-v2` → indigo + blue |

**Critical gap:** No `mat.m2-define-dark-theme` exists. Material dialogs, select panels, menus, tooltips, datepickers will not respond to any CSS-variable-based dark mode — they require explicit Angular Material dark theme integration.

---

## Shared Libraries — Protected (DO NOT MODIFY)

| Library | Package | Status |
|---|---|---|
| `jx-cell` | `file:jx-cell-6.9.0.tgz` | ⛔ Protected — adapt via consumer CSS |
| `pl-core-utils-library` | `^2.1.3` | ⛔ Protected |
| `pl-decorator` | `^1.4.30` | ⛔ Protected |
| `pl-dynamicform` | `^1.0.20` | ⛔ Protected — adapt via `.app-v1` / `.app-v2` scoped overrides |
| `pl-loading-trace` | `^1.2.2` | ⛔ Protected |
| `ux-directives` | `^0.0.5` | ⛔ Protected — CSS imported via `ux-directives.css` |

---

## Routes (UI Surfaces to Verify)

| Route | Module | Priority |
|---|---|---|
| `/home` | `IndexModule` (homepage) | HIGH |
| `/period` | Timesheet v1 / v2 (gated by `canMatch`) | HIGH |
| `/period/:periodId` | Timesheet detail | HIGH |
| `/periodcontrol` | Period control | HIGH |
| `/approve` | List approved | HIGH |
| `/allbusinesses` | All businesses | MEDIUM |
| `/adminconsole` | Admin console | MEDIUM |
| `/delegation` | Delegation | MEDIUM |
| `/settings` | Settings | MEDIUM |
| `/holidays` | Holidays | MEDIUM |
| `/roles` | Roles | LOW |
| `/errorpage` | Error page | LOW |

---

## Hardcoded Colors — SCSS/CSS Files (39 files affected)

### HIGH RISK — Component SCSS with hardcoded hex (not token-based)

| File | Occurrences | Examples |
|---|---|---|
| `menu.component.scss` | ~40 | `#eb5e2d`, `#ba3d12`, `#333`, `#fff` — brand + text hardcoded |
| `chat-ia.component.scss` | ~35 | `#fff`, `#111827`, `#6b7280`, `#2563eb` — fully Tailwind-style hardcoded palette |
| `status.component.scss` | ~18 | `#4caf50`, `#7200e5`, `#f08f05`, `#e6e6e6` — status badge colors hardcoded |
| `header-time-vision.component.scss` | ~5 | `#e0b12d`, `#c89200`, `#2b2b2b`, `#FFF` — hardcoded brand accent |
| `_forms.scss` | ~5 | `#fafafa`, `#f2f2f2`, `#ffffff`, `#d9dee7`, `#24324a` |
| `_table.scss` | ~5 | `#ffffff`, `#d9dee7`, `#24324a`, `#4a5a75`, `#edf1f5` |
| `breadcrumb.component.scss` | ~7 | `#f5f5f5`, `#757575`, `#616e7e`, `#73849a`, `#f59c29` |
| `snack-bar.component.scss` | ~4 | `#fff`, `#4caf50`, `#f44336`, `#ff9800` |
| `material-dialog.component.scss` | ~5 | `#fff`, `#374151`, `#e5e7eb` |

### MEDIUM RISK — Theme/token files with hardcoded hex (expected but not Fluent UI compliant)

| File | Note |
|---|---|
| `_variables.scss` | SCSS compile-time vars — brand `#f37226`, `#eb5e2d`, `#28a745` etc. Not Fluent UI |
| `_light.scss` | CSS vars — `white`, `#f5f5f5`, `#333333` etc. Not mapped to Fluent UI tokens |
| `_dark.scss` | CSS vars — `#1e1e1e`, `#444`, `#2c2c2c` etc. Close to Fluent UI but not aligned |
| `_ionic.scss` | Ionic CSS vars — partially maps to dark, but uses custom grays |

### LOW RISK — Vendor/legacy (do not modify)

| File | Note |
|---|---|
| `theme-old/` | Archived — not loaded in production |
| `indigo-pink.css` | Compiled Angular Material CSS — vendor |
| `jsuites.css`, `jexcel.css` | Vendor spreadsheet styles |
| `styles.css` | Legacy compiled CSS |

---

## SVG / Icon Audit

### SVG assets with hardcoded `fill` (as `<img>` or inline)

- **69 out of 175 SVG files** in `src/assets` contain hardcoded `fill="#..."` values.
- These cannot be recolored via CSS when used as `<img>`.
- Must be verified visually in dark mode via Playwright.
- Candidates for conversion to inline SVG or icon font.

**Critical examples:**
- `logo-agic-v3.svg`, `logo-agic.svg` — brand logos, likely light-mode only
- `HomeIcon.svg`, `CalendarIcon.svg`, `SettingsIcon.svg`, `TrashcanIcon.svg` — action icons likely using dark fills

### Hardcoded `fill` in SCSS / HTML (live code)

| Location | Line | Value | Risk |
|---|---|---|---|
| `error-page.component.html` | L47 | `fill: #121320` | HIGH — dark fill invisible on dark bg |
| `menu.component.scss` | L220 | `fill: #333 !important` | HIGH — dark fill invisible in dark mode |
| `menu.component.scss` | L476, L498, L611 | `fill: #fff !important` | MEDIUM — white fill OK on dark bg |
| `menu.component.scss` | L619 | `fill: #333 !important` | HIGH |
| `_webcam.scss` | L98 | `fill: #00ffcc` | LOW — webcam overlay |
| `global.scss` | L309–L312 | `fill: #198754`, `fill: #fd7e14` | MEDIUM — SVG chart tags |
| `index.html` | L47 | `fill: #121320` | HIGH — inline SVG in HTML shell |

### Icon fonts

- `@fortawesome/fontawesome-free` — imported globally in `global.scss`
- `Material Icons` — used via `mat-icon` / `material-icons`
- `ionicons` — Ionic icon set (SVG-based via `<ion-icon>`)
- **None of these are explicitly scoped for dark mode** via `--pl-icon-fg` tokens

---

## Accessibility — Preliminary Contrast Assessment

Using **Fluent UI dark surface `#292929`** as reference background:

| Current token / color | Hex | Contrast vs #292929 | Status |
|---|---|---|---|
| `darkreader`-inverted text | dynamic | Unknown — computed at runtime | ⚠️ NEEDS_MANUAL_REVIEW |
| `#333` (hardcoded dark text) | #333333 | ~1.2:1 | ❌ FAIL — invisible on dark bg |
| `#121320` (SVG fill) | #121320 | ~1.1:1 | ❌ FAIL — invisible on dark bg |
| `#1e1e1e` (_dark.scss bg) | #1e1e1e | n/a (bg on bg) | ❌ no contrast |
| `#fff` (hardcoded white) | #ffffff | ~14:1 | ✅ PASS |
| `#eb5e2d` (brand orange) | #eb5e2d | ~4.2:1 | ⚠️ BORDERLINE — below 4.5 for normal text |
| `#4caf50` (success) | #4caf50 | ~5.1:1 | ✅ PASS AA |
| `#f44336` (error) | #f44336 | ~4.0:1 | ⚠️ BORDERLINE |

> Full contrast check requires Playwright runtime audit. Values above are static estimates.

---

## Issues Found

### CRITICAL

1. **`ThemeService` uses `darkreader` — no native CSS token switch.** Dark mode is applied by a JS DOM manipulator, not by swapping CSS custom properties. This means dark mode cannot be reliably audited, tested, or guaranteed to work correctly on all surfaces.

2. **`.dark-mode` CSS class in `_dark.scss` is never applied.** The `ThemeService.setDarkMode()` does not toggle any class on `document.documentElement` — it calls `darkreader.enable()`. The entire `_dark.scss` ruleset is **dead code**.

3. **No Angular Material dark theme defined.** `mat.m2-define-dark-theme` is missing. All Material overlays (dialogs, select, tooltip, datepicker, snackbar, menu) will not respond to dark mode.

4. **69/175 SVG assets have hardcoded fills** — used as `<img>` they cannot be tematizzed. High risk of invisible icons on dark background.

5. **`fill: #333` and `fill: #121320` in live SCSS/HTML** — these dark fills become invisible on any dark background.

### HIGH

6. **`chat-ia.component.scss` uses a full Tailwind-style hardcoded palette** (~35 hex values). None are CSS variables. Will not respond to theme switching.

7. **`status.component.scss` uses hardcoded status colors** — not mapped to `--pl-status-*` tokens.

8. **`menu.component.scss` uses SCSS variables (`$menu-orange`) instead of CSS variables** — compile-time only, cannot be switched at runtime.

9. **`_dark.scss` uses `rgba(0, 0, 0, 0.5)` for shadow** — close to Fluent UI `rgba(0,0,0,0.30)` but not aligned.

### MEDIUM

10. **`darkreader` `addListener` uses deprecated API** — will throw warnings in modern browsers.

11. **No `localStorage` persistence** of theme preference.

12. **No `prefers-color-scheme` system detection at init** (only via `isUserUsingDarkMode()` which must be called explicitly).

13. **Brand primary is `#f37226` / `#eb5e2d`** (orange) — not `#0f6cbd` (Fluent UI blue). The Fluent UI accent tokens must be overridden with the TimeVision brand color if brand identity is maintained.

14. **`_forms.scss` and `_table.scss`** have hardcoded background and text colors that will not adapt to dark mode.

---

## Residual Issues (Pre-Implementation)

- `jx-cell` spreadsheet library: dark mode handled via jExcel CSS vars in `_dark.scss` — partially covered.
- `ux-directives.css` loaded globally — unknown dark mode support, must be tested.
- `pl-dynamicform` — rendered inside `.app-v1` / `.app-v2` — no dark theme awareness.
- Angular Material `OverlayContainer` not configured for dark class.
- Ionic components (`ion-app`, `ion-item`, `ion-toolbar`) use Ionic CSS vars — partially covered in `_dark.scss` but only if `.dark-mode` class is applied (currently not triggered).

---

## Implementation Plan (Proposed — Requires Approval)

### Phase 1 — Fix ThemeService (low risk, high impact)

1. Replace `darkreader` toggle with native CSS class toggle:
   - Add `document.documentElement.classList.toggle('dark-mode', isDarkMode)` in `setDarkMode()`
   - Keep `darkreader` as optional fallback or remove
   - Add `localStorage` persistence
   - Fix deprecated `addListener` → `addEventListener('change', ...)`

### Phase 2 — Migrate CSS tokens to Fluent UI standard (medium risk)

2. Migrate `_dark.scss` `:root.dark-mode` vars to Fluent UI token names (`--pl-bg-*`, `--pl-text-*`, etc.)
3. Add full Fluent UI token map to `_light.scss` (`:root`) and `_dark.scss` (`:root.dark-mode`)
4. Update `_variables.scss` SCSS brand vars to reference Fluent UI token values

### Phase 3 — Angular Material dark theme (medium risk)

5. Add `mat.m2-define-dark-theme` in `global.scss`
6. Configure `OverlayContainer` in `AppModule` to apply `.dark-mode` class to overlay DOM

### Phase 4 — Component-level fixes (medium risk, scoped)

7. Migrate `status.component.scss` → `--pl-status-*` tokens
8. Migrate `snack-bar.component.scss` → `--pl-status-*` tokens
9. Migrate `_forms.scss`, `_table.scss` → `--pl-bg-*`, `--pl-text-*`, `--pl-border-*` tokens
10. Migrate `breadcrumb.component.scss` → tokens
11. Migrate `header-time-vision.component.scss` → tokens (brand accent → `--pl-accent`)
12. Migrate `menu.component.scss` SCSS vars → CSS vars with dark override

### Phase 5 — SVG / Icon fixes (medium risk)

13. Patch `fill: #333` / `fill: #121320` in `menu.component.scss` and `error-page.component.html` → `var(--pl-icon-fg)`
14. Add icon font dark mode override (`mat-icon`, `.fa`, `ion-icon` → `color: var(--pl-icon-fg)`)
15. SVG assets: convert high-priority action icons (HomeIcon, CalendarIcon, etc.) to use `currentColor`; document remainder as residual

### Phase 6 — chat-ia.component.scss (medium risk, isolated)

16. Migrate `chat-ia.component.scss` hardcoded palette → Fluent UI tokens

---

## Risk Matrix

| Change | Risk | Reversible |
|---|---|---|
| ThemeService class toggle | LOW | ✅ Yes |
| _dark.scss token migration | LOW | ✅ Yes |
| Angular Material dark theme | MEDIUM | ✅ Yes (scoped) |
| Component SCSS token migration | MEDIUM | ✅ Yes |
| SVG fill patch (CSS override) | LOW | ✅ Yes |
| SVG asset conversion | MEDIUM | ✅ Yes (git) |
| chat-ia migration | LOW (isolated) | ✅ Yes |

---

## Commands to Run After Implementation

```bash
# Build verification
ng build

# Playwright visual audit (when dev server is running)
npx playwright test tests/ --project=chromium

# Quick contrast spot-check (manual)
# Open /home, /period, /approve in dark mode and inspect with browser devtools
```

---

## Rollback Plan

```bash
# If any change breaks the build or introduces visual regression:
git diff --stat               # inspect scope of changes
git stash                     # revert all uncommitted changes
# OR
git checkout src/styles/themes/_dark.scss
git checkout src/app/cloud/agic/core/service/theme.service.ts
git checkout src/global.scss
```

---

## Final Status

| Check | Status |
|---|---|
| Build | Not run (audit only) |
| Playwright | Not run (audit only) |
| Contrast | Static estimate only — Requires runtime |
| Shared libraries modified | ❌ No — audit read-only |
| Files modified | ❌ None — audit read-only |
| Implementation plan | ✅ Produced |
| Rollback plan | ✅ Available |
