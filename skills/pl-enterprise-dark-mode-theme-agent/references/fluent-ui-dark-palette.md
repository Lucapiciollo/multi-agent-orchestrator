# Fluent UI Dark Palette — Reference Obbligatorio

> Questa palette è la **fonte di verità imperativa** per tutte le implementazioni dark mode.
> Riferimento ufficiale: https://fluent2.microsoft.design/color
> Versione: Fluent UI React v9 / Fluent 2 Design System

---

## Regola d'uso

**OGNI colore applicato in dark mode DEVE corrispondere a un token in questa lista.**
Non è accettabile introdurre hex arbitrari.
Se non esiste un token preciso, usa il token semanticamente più vicino e documentalo.

---

## Neutral Colors — Dark Theme

| Token CSS var | Fluent UI Token | Hex | Uso |
|---|---|---|---|
| `--pl-bg-page` | `colorNeutralBackground2` | `#1f1f1f` | Sfondo pagina principale |
| `--pl-bg-surface` | `colorNeutralBackground1` | `#292929` | Card, panel, surface |
| `--pl-bg-elevated` | `colorNeutralBackground3` | `#3d3d3d` | Elevated surfaces, dropdown, tooltip |
| `--pl-bg-subtle` | `colorSubtleBackgroundHover` | `#2c2c2c` | Subtle background hover |
| `--pl-bg-hover` | `colorNeutralBackground1Hover` | `#3d3d3d` | Hover state background |
| `--pl-bg-pressed` | `colorNeutralBackground1Pressed` | `#1f1f1f` | Pressed state background |
| `--pl-bg-disabled` | `colorNeutralBackground3` | `#3d3d3d` | Disabled background |
| `--pl-bg-overlay` | `colorNeutralBackground4` | `#525252` | Overlay, scrim leggero |

---

## Text Colors — Dark Theme

| Token CSS var | Fluent UI Token | Hex | Uso |
|---|---|---|---|
| `--pl-text-primary` | `colorNeutralForeground1` | `#ffffff` | Testo principale |
| `--pl-text-secondary` | `colorNeutralForeground2` | `#d6d6d6` | Testo secondario, label |
| `--pl-text-tertiary` | `colorNeutralForeground3` | `#adadad` | Testo terziario, hint, placeholder |
| `--pl-text-quaternary` | `colorNeutralForeground4` | `#8a8a8a` | Testo decorativo |
| `--pl-text-disabled` | `colorNeutralForegroundDisabled` | `#5c5c5c` | Testo disabilitato |
| `--pl-text-on-brand` | `colorNeutralForegroundOnBrand` | `#ffffff` | Testo su sfondo brand |
| `--pl-text-inverse` | `colorNeutralForegroundInverted` | `#242424` | Testo su sfondo chiaro in dark mode |

---

## Brand / Accent Colors — Dark Theme

| Token CSS var | Fluent UI Token | Hex | Uso |
|---|---|---|---|
| `--pl-accent` | `colorBrandBackground` | `#0f6cbd` | Background brand (bottoni primari) |
| `--pl-accent-hover` | `colorBrandBackgroundHover` | `#1e88e5` | Hover brand background |
| `--pl-accent-pressed` | `colorBrandBackgroundPressed` | `#0c3b5e` | Pressed brand background |
| `--pl-accent-selected` | `colorBrandBackgroundSelected` | `#0c3b5e` | Selected brand background |
| `--pl-accent-fg` | `colorBrandForeground1` | `#479ef5` | Testo/icona brand su sfondo dark |
| `--pl-accent-fg-2` | `colorBrandForeground2` | `#62abf5` | Testo/icona brand secondario |
| `--pl-accent-stroke` | `colorBrandStroke1` | `#479ef5` | Bordo brand |
| `--pl-accent-stroke-2` | `colorBrandStroke2` | `#62abf5` | Bordo brand secondario |

---

## Border / Stroke Colors — Dark Theme

| Token CSS var | Fluent UI Token | Hex | Uso |
|---|---|---|---|
| `--pl-border-1` | `colorNeutralStroke1` | `#666666` | Bordo principale |
| `--pl-border-2` | `colorNeutralStroke2` | `#525252` | Bordo secondario |
| `--pl-border-3` | `colorNeutralStroke3` | `#3d3d3d` | Bordo leggero / separatore |
| `--pl-border-disabled` | `colorNeutralStrokeDisabled` | `#3d3d3d` | Bordo disabilitato |
| `--pl-border-accessible` | `colorNeutralStrokeAccessible` | `#adadad` | Bordo accessibile (WCAG) |

---

## Icon Colors — Dark Theme

| Token CSS var | Fluent UI Token | Hex | Uso |
|---|---|---|---|
| `--pl-icon-fg` | `colorNeutralForeground1` | `#ffffff` | Icona principale |
| `--pl-icon-fg-secondary` | `colorNeutralForeground2` | `#d6d6d6` | Icona secondaria |
| `--pl-icon-fg-tertiary` | `colorNeutralForeground3` | `#adadad` | Icona terziaria / decorativa |
| `--pl-icon-fg-brand` | `colorBrandForeground1` | `#479ef5` | Icona brand / accent |
| `--pl-icon-fg-disabled` | `colorNeutralForegroundDisabled` | `#5c5c5c` | Icona disabilitata |
| `--pl-icon-fg-on-brand` | `colorNeutralForegroundOnBrand` | `#ffffff` | Icona su sfondo brand |
| `--pl-icon-fg-success` | `colorStatusSuccessForeground1` | `#54b054` | Icona stato success |
| `--pl-icon-fg-warning` | `colorStatusWarningForeground1` | `#fcba19` | Icona stato warning |
| `--pl-icon-fg-error` | `colorStatusDangerForeground1` | `#f1707b` | Icona stato error/danger |
| `--pl-icon-fg-info` | `colorStatusInformationForeground1` | `#62abf5` | Icona stato info |

---

## Status Colors — Dark Theme

| Token CSS var | Fluent UI Token | Hex | Uso |
|---|---|---|---|
| `--pl-status-success` | `colorStatusSuccessForeground1` | `#54b054` | Success foreground |
| `--pl-status-success-bg` | `colorStatusSuccessBackground1` | `#393d1b` | Success background |
| `--pl-status-warning` | `colorStatusWarningForeground1` | `#fcba19` | Warning foreground |
| `--pl-status-warning-bg` | `colorStatusWarningBackground1` | `#4a3400` | Warning background |
| `--pl-status-error` | `colorStatusDangerForeground1` | `#f1707b` | Error/danger foreground |
| `--pl-status-error-bg` | `colorStatusDangerBackground1` | `#3b0509` | Error background |
| `--pl-status-info` | `colorStatusInformationForeground1` | `#62abf5` | Info foreground |
| `--pl-status-info-bg` | `colorStatusInformationBackground1` | `#002848` | Info background |

---

## Shadow / Elevation — Dark Theme

| Token CSS var | Fluent UI Token | Valore | Uso |
|---|---|---|---|
| `--pl-shadow-ambient` | `colorNeutralShadowAmbient` | `rgba(0,0,0,0.30)` | Shadow ambient |
| `--pl-shadow-key` | `colorNeutralShadowKey` | `rgba(0,0,0,0.25)` | Shadow key |
| `--pl-scrim` | modal scrim | `rgba(0,0,0,0.60)` | Dialog/modal overlay |
| `--pl-shadow-2` | Shadow2 | `0 1px 2px rgba(0,0,0,0.30), 0 1px 4px rgba(0,0,0,0.25)` | Card elevation 2 |
| `--pl-shadow-4` | Shadow4 | `0 2px 4px rgba(0,0,0,0.30), 0 0 2px rgba(0,0,0,0.25)` | Panel elevation 4 |
| `--pl-shadow-8` | Shadow8 | `0 4px 8px rgba(0,0,0,0.30), 0 0 2px rgba(0,0,0,0.25)` | Flyout elevation 8 |
| `--pl-shadow-16` | Shadow16 | `0 8px 16px rgba(0,0,0,0.30), 0 0 2px rgba(0,0,0,0.25)` | Dialog elevation 16 |

---

## Regole SVG e Icon

### SVG inline — obbligatorio

```scss
/* Tutti gli SVG inline devono usare currentColor o token esplicito */
.icon svg,
svg.icon {
  fill: currentColor;
  color: var(--pl-icon-fg);
}

/* Mai questo: */
/* fill: #333; */ /* VIETATO */
/* stroke: #ffffff; */ /* VIETATO se hardcoded */
```

### Sostituzione fill hardcoded in SVG

Se un SVG ha `fill="#xxxxxxx"` hardcoded:

1. Verificare se è inline nel DOM o è un file `.svg` come asset;
2. Se inline: sovrascrivere via CSS con `fill: var(--pl-icon-fg)` o token pertinente;
3. Se come `<img src="...svg">`: non ricolorabile via CSS — segnalare come residual issue e proporre conversione a inline SVG.

### Verifica automatica con grep

```bash
# Trova fill/stroke hardcoded in SCSS, HTML, SVG
grep -rn 'fill\s*:\s*#\|stroke\s*:\s*#\|fill="#\|stroke="#' src/ \
  --include='*.scss' \
  --include='*.html' \
  --include='*.svg' \
  --include='*.ts'
```

---

## Quick Reference SCSS mixin

```scss
// _fluent-icons.scss
@mixin fluent-icon-colors {
  fill: var(--pl-icon-fg);
  color: var(--pl-icon-fg);

  &.secondary { fill: var(--pl-icon-fg-secondary); color: var(--pl-icon-fg-secondary); }
  &.brand     { fill: var(--pl-icon-fg-brand);     color: var(--pl-icon-fg-brand); }
  &.disabled  { fill: var(--pl-icon-fg-disabled);  color: var(--pl-icon-fg-disabled); }
  &.success   { fill: var(--pl-status-success);    color: var(--pl-status-success); }
  &.warning   { fill: var(--pl-status-warning);    color: var(--pl-status-warning); }
  &.error     { fill: var(--pl-status-error);      color: var(--pl-status-error); }
  &.info      { fill: var(--pl-status-info);       color: var(--pl-status-info); }
}
```
