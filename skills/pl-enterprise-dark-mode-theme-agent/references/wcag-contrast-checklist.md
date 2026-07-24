# WCAG Contrast Checklist

> **REGOLA IMPERATIVA**: Tutti i valori di contrasto devono essere verificati usando la palette **Fluent UI Microsoft**.
> Non è accettabile un pass WCAG basato su colori arbitrari. I token devono essere Fluent UI.

## Mandatory AA targets

- Normal text: 4.5:1.
- Large text: 3:1.
- UI components and graphical objects: 3:1.
- **Icone e SVG: 3:1 minimo** (come graphical objects).

## Critical blockers

Block or rollback if these fail severely:

- primary page text;
- button label;
- form input text;
- validation error text;
- main navigation;
- dialog title/content;
- table body text;
- **icone di azione** (action icons in toolbar, table, FAB);
- **icone di stato** (success, warning, error, info);
- **icone di navigazione** (sidebar, tab bar, breadcrumb).

## States to check

- default;
- hover;
- focus;
- active;
- selected;
- disabled;
- error;
- warning;
- success.

## Components to check

- button;
- icon button;
- input;
- select;
- checkbox;
- radio;
- table;
- card;
- dialog;
- menu;
- tooltip;
- chip;
- badge;
- snackbar;
- **SVG icon inline** (ogni fill/stroke deve rispettare 3:1);
- **icon font** (Material Icons, FontAwesome, Fluent System Icons);
- **status icon** (check, warning, error, info);
- **nav icon** (sidebar, tab, breadcrumb);
- **form icon** (prefix, suffix, clear button, password toggle, calendar);
- **action icon** (edit, delete, download, upload, refresh);
- **expand/collapse icon** (tree, accordion, panel);
- **sort/filter icon** (tabelle);
- **drag handle icon**;
- **step icon** (stepper);
- **chart legend symbol**;
- **notification icon / alert icon**;
- **file type icon**;
- **avatar placeholder icon**.

## SVG-specific checks

Per ogni SVG o icona grafica:

| Controllo | Standard | Note |
|---|---|---|
| Contrasto fill vs sfondo | ≥ 3:1 | WCAG 1.4.11 Non-text Contrast |
| Contrasto stroke vs sfondo | ≥ 3:1 | WCAG 1.4.11 |
| SVG come `<img>` leggibile | visivo | Playwright screenshot verify |
| PNG trasparente su dark bg | visivo | Playwright screenshot verify |
| `currentColor` inheritance | tecnico | grep verifica |
| Fill hardcoded in SVG | tecnico | grep `fill="#` |

## Fluent UI token — contrasto garantito (dark theme)

I token seguenti superano WCAG AA su `--pl-bg-surface` (`#292929`):

| Token | Hex | Contrasto vs #292929 |
|---|---|---|
| `--pl-text-primary` / `--pl-icon-fg` | `#ffffff` | ~14:1 ✅ AAA |
| `--pl-text-secondary` / `--pl-icon-fg-secondary` | `#d6d6d6` | ~8.5:1 ✅ AAA |
| `--pl-text-tertiary` / `--pl-icon-fg-tertiary` | `#adadad` | ~5.2:1 ✅ AA |
| `--pl-accent-fg` / `--pl-icon-fg-brand` | `#479ef5` | ~5.8:1 ✅ AA |
| `--pl-status-success` | `#54b054` | ~4.5:1 ✅ AA |
| `--pl-status-warning` | `#fcba19` | ~9.3:1 ✅ AAA |
| `--pl-status-error` | `#f1707b` | ~4.8:1 ✅ AA |
| `--pl-status-info` | `#62abf5` | ~5.5:1 ✅ AA |

**Attenzione**: `--pl-text-disabled` / `--pl-icon-fg-disabled` (`#5c5c5c`) è intenzionalmente sotto AA — è uno stato disabled.

## Design rule

Non risolvere il contrasto rendendolo tutto bianco puro. Usa i token Fluent UI semantici.
Il token `--pl-text-primary` (`#ffffff`) è riservato ai contenuti primari.
Il token `--pl-text-secondary` (`#d6d6d6`) è per label e contenuti secondari.

