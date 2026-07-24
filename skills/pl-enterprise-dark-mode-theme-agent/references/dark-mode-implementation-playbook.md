# Dark Mode Implementation Playbook

> **REGOLA IMPERATIVA**: La palette da usare è **esclusivamente Fluent UI Microsoft Design System**.
> I token hex qui sotto sono i valori ufficiali Fluent UI v9. Non sostituirli con valori arbitrari.

## 1. Discovery

Inspect:

- `angular.json` styles entries;
- global styles;
- SCSS folders;
- theme files;
- Material theme configuration;
- component-level SCSS;
- hardcoded colors in HTML and TS;
- library imports;
- route structure;
- **tutti i file SVG** nel progetto (inline e come asset);
- **tutti gli icon font** usati (Material Icons, FontAwesome, Fluent System Icons, custom);
- **tutti i `fill` e `stroke` hardcoded** in SVG e CSS;
- **immagini raster** che potrebbero avere problemi di contrasto su sfondo dark.

## 2. Token map

> La token map sotto è basata sui **Fluent UI v9 official design tokens**. È obbligatoria.
> Riferimento ufficiale: https://fluent2.microsoft.design/color

```scss
:root {
  /* === FLUENT UI LIGHT THEME === */
  --pl-bg-page:              #f5f5f5;  /* colorNeutralBackground2 */
  --pl-bg-surface:           #ffffff;  /* colorNeutralBackground1 */
  --pl-bg-elevated:          #ffffff;  /* colorNeutralBackground1 */
  --pl-bg-subtle:            #fafafa;  /* colorSubtleBackground */
  --pl-bg-hover:             #f0f0f0;  /* colorNeutralBackground1Hover */
  --pl-bg-pressed:           #e8e8e8;  /* colorNeutralBackground1Pressed */
  --pl-text-primary:         #242424;  /* colorNeutralForeground1 */
  --pl-text-secondary:       #616161;  /* colorNeutralForeground2 */
  --pl-text-tertiary:        #707070;  /* colorNeutralForeground3 */
  --pl-text-disabled:        #bdbdbd;  /* colorNeutralForegroundDisabled */
  --pl-text-on-brand:        #ffffff;  /* colorNeutralForegroundOnBrand */
  --pl-border-1:             #d1d1d1;  /* colorNeutralStroke1 */
  --pl-border-2:             #e0e0e0;  /* colorNeutralStroke2 */
  --pl-border-3:             #f0f0f0;  /* colorNeutralStroke3 */
  --pl-accent:               #0f6cbd;  /* colorBrandBackground */
  --pl-accent-hover:         #115ea3;  /* colorBrandBackgroundHover */
  --pl-accent-pressed:       #0c3b5e;  /* colorBrandBackgroundPressed */
  --pl-accent-fg:            #0f6cbd;  /* colorBrandForeground1 */
  --pl-accent-fg-2:          #0e5fa8;  /* colorBrandForeground2 */
  --pl-icon-fg:              #242424;  /* colorNeutralForeground1 */
  --pl-icon-fg-secondary:    #616161;  /* colorNeutralForeground2 */
  --pl-icon-fg-brand:        #0f6cbd;  /* colorBrandForeground1 */
  --pl-icon-fg-disabled:     #bdbdbd;  /* colorNeutralForegroundDisabled */
  --pl-status-success:       #107c10;  /* colorStatusSuccessForeground1 */
  --pl-status-warning:       #f7630c;  /* colorStatusWarningForeground1 */
  --pl-status-error:         #c50f1f;  /* colorStatusDangerForeground1 */
  --pl-status-info:          #0078d4;  /* colorStatusInformationForeground1 */
  --pl-shadow-ambient:       rgba(0, 0, 0, 0.12);  /* colorNeutralShadowAmbient */
  --pl-shadow-key:           rgba(0, 0, 0, 0.14);  /* colorNeutralShadowKey */
  --pl-scrim:                rgba(0, 0, 0, 0.40);  /* dialog/modal scrim */
}

html[data-theme='dark'] {
  /* === FLUENT UI DARK THEME === */
  --pl-bg-page:              #1f1f1f;  /* colorNeutralBackground2 dark */
  --pl-bg-surface:           #292929;  /* colorNeutralBackground1 dark */
  --pl-bg-elevated:          #3d3d3d;  /* colorNeutralBackground3 dark */
  --pl-bg-subtle:            #2c2c2c;  /* colorSubtleBackgroundHover dark */
  --pl-bg-hover:             #3d3d3d;  /* colorNeutralBackground1Hover dark */
  --pl-bg-pressed:           #1f1f1f;  /* colorNeutralBackground1Pressed dark */
  --pl-text-primary:         #ffffff;  /* colorNeutralForeground1 dark */
  --pl-text-secondary:       #d6d6d6;  /* colorNeutralForeground2 dark */
  --pl-text-tertiary:        #adadad;  /* colorNeutralForeground3 dark */
  --pl-text-disabled:        #5c5c5c;  /* colorNeutralForegroundDisabled dark */
  --pl-text-on-brand:        #ffffff;  /* colorNeutralForegroundOnBrand dark */
  --pl-border-1:             #666666;  /* colorNeutralStroke1 dark */
  --pl-border-2:             #525252;  /* colorNeutralStroke2 dark */
  --pl-border-3:             #3d3d3d;  /* colorNeutralStroke3 dark */
  --pl-accent:               #0f6cbd;  /* colorBrandBackground dark */
  --pl-accent-hover:         #1e88e5;  /* colorBrandBackgroundHover dark */
  --pl-accent-pressed:       #0c3b5e;  /* colorBrandBackgroundPressed dark */
  --pl-accent-fg:            #479ef5;  /* colorBrandForeground1 dark */
  --pl-accent-fg-2:          #62abf5;  /* colorBrandForeground2 dark */
  --pl-icon-fg:              #ffffff;  /* colorNeutralForeground1 dark */
  --pl-icon-fg-secondary:    #d6d6d6;  /* colorNeutralForeground2 dark */
  --pl-icon-fg-brand:        #479ef5;  /* colorBrandForeground1 dark */
  --pl-icon-fg-disabled:     #5c5c5c;  /* colorNeutralForegroundDisabled dark */
  --pl-status-success:       #54b054;  /* colorStatusSuccessForeground1 dark */
  --pl-status-warning:       #fcba19;  /* colorStatusWarningForeground1 dark */
  --pl-status-error:         #f1707b;  /* colorStatusDangerForeground1 dark */
  --pl-status-info:          #62abf5;  /* colorStatusInformationForeground1 dark */
  --pl-shadow-ambient:       rgba(0, 0, 0, 0.30);  /* colorNeutralShadowAmbient dark */
  --pl-shadow-key:           rgba(0, 0, 0, 0.25);  /* colorNeutralShadowKey dark */
  --pl-scrim:                rgba(0, 0, 0, 0.60);  /* dialog/modal scrim dark */
}
```

## 3. Apply tokens

Replace hardcoded color values with semantic tokens **Fluent UI**.

Good:

```scss
.card {
  background: var(--pl-bg-surface);      /* colorNeutralBackground1 */
  color: var(--pl-text-primary);          /* colorNeutralForeground1 */
  border: 1px solid var(--pl-border-1);   /* colorNeutralStroke1 */
}

/* Icona SVG inline — obbligatorio */
.my-icon {
  fill: var(--pl-icon-fg);               /* colorNeutralForeground1 */
  /* oppure: */
  color: var(--pl-icon-fg);
}

/* SVG con currentColor (preferred) */
.my-svg-icon svg {
  fill: currentColor;
  color: var(--pl-icon-fg);
}

/* Icon font */
.mat-icon,
.icon {
  color: var(--pl-icon-fg);
}
```

Bad:

```scss
.card {
  background: #111;
  color: white;
}

/* MAI hardcoded nei SVG */
.my-icon {
  fill: #333333;   /* VIETATO — usare var(--pl-icon-fg) */
}
```

## 4. Icon & SVG Audit (obbligatorio)

Ogni icona e SVG nel progetto deve essere verificato:

### 4.1 SVG inline

```bash
# Trovare tutti i fill/stroke hardcoded nei file SCSS e HTML
grep -r 'fill:#\|fill: #\|stroke:#\|stroke: #' src/ --include='*.scss' --include='*.html' --include='*.svg'
```

Per ogni SVG inline trovato:
- Verificare se usa `fill="currentColor"` o `fill` hardcoded;
- Se hardcoded → sovrascrivere via CSS con `var(--pl-icon-fg)` o token pertinente;
- Aggiungere al report come "SVG icon patched".

### 4.2 SVG come `<img>`

- Non possono essere ricolorati via CSS;
- Verificare visivamente in dark mode con Playwright;
- Se il SVG ha colori che contrastano male con `--pl-bg-surface`, segnalare come residual issue;
- Proporre conversione a inline SVG o icon font se possibile.

### 4.3 Icon font (Material Icons, FontAwesome, Fluent System Icons)

```scss
/* Override obbligatorio in dark theme */
html[data-theme='dark'] {
  .mat-icon,
  .material-icons,
  .fa,
  .fas,
  .far,
  .icon {
    color: var(--pl-icon-fg);
  }

  /* Brand icons */
  .mat-icon.brand-icon {
    color: var(--pl-icon-fg-brand);
  }

  /* Disabled icons */
  .mat-icon[disabled],
  .mat-icon.disabled {
    color: var(--pl-icon-fg-disabled);
  }
}
```

### 4.4 Immagini raster (PNG, JPG, WebP)

- Verificare visivamente con Playwright;
- Segnalare se immagini con sfondo trasparente mostrano artefatti su dark background;
- Proporre `filter: brightness(0.9)` o adattamento CSS se l'immagine risulta troppo brillante.

## 5. Material integration

If Angular Material is present, verify:

- `mat.define-light-theme`;
- `mat.define-dark-theme`;
- typography config;
- density config;
- component themes;
- overlay container theme class.

**Nota**: la palette Material deve usare il Fluent UI brand color `#0f6cbd` come primary.

## 6. Runtime switching

Preferred behavior:

- `data-theme` on `html`;
- localStorage persistence;
- system preference support;
- tenant-ready extension point.

## 7. Verification

Run:

- build;
- Playwright screenshots (light + dark);
- contrast checks (WCAG AA su tutti gli elementi critici);
- icon/SVG audit (fill/stroke su tutti gli asset grafici);
- responsive checks;
- manual review of critical pages;
- verifica che NESSUN colore hex arbitrario sia stato introdotto al di fuori dei Fluent UI tokens.

## 8. Gotchas & Advanced Techniques (cross-project)

> Tecniche generali valide per **qualsiasi** progetto Angular enterprise
> (Material + Ionic + librerie griglia + overlay CDK). Sono i punti che fanno
> perdere più tempo se non conosciuti a priori.

### 8.1 Attivazione a classe + overlay CDK

I dialog/menu/select/tooltip/datepicker CDK vivono in `.cdk-overlay-container`,
**fuori** dal DOM dell'app: la classe di tema va aggiunta sia al root sia al
container overlay.

```ts
// ThemeService
setDark(on: boolean) {
  const cls = 'dark-mode';
  document.documentElement.classList.toggle(cls, on);
  this.overlayContainer.getContainerElement().classList.toggle(cls, on);
  localStorage.setItem('app-theme', on ? 'dark' : 'light');
}
isDark(): boolean {
  const saved = localStorage.getItem('app-theme');
  if (saved) return saved === 'dark';
  return matchMedia('(prefers-color-scheme: dark)').matches;
}
```

```scss
// Il container overlay riceve la classe → NON dargli sfondo opaco
.cdk-overlay-container.dark-mode { background: transparent !important; }
// Gli sfondi pagina si scopano al root, non al container
html.dark-mode { background-color: var(--pl-bg-page); }
```

### 8.2 Specificità per battere gli stili component-scoped

```scss
// Batte `.list-client[_ngcontent-xxx] { background: white !important }`
html.dark-mode .list-client { background: var(--pl-bg-surface) !important; }
```

Regola: `html.dark-mode .cls` (elem+classe in più) vince a parità di classi
anche con `!important` presente su entrambi.

### 8.3 `:host-context()` vs classe antenato dentro un componente

```scss
// ❌ SBAGLIATO dentro un componente: l'encapsulation aggiunge [_ngcontent]
//    anche a .app-v1 (che sta su ion-app, fuori dal componente) → non matcha
// .app-v1 button.round-button { height: 48px !important; }

// ✅ CORRETTO: :host-context compila .app-v1 come antenato "nudo"
:host-context(.app-v1) button.round-button.mat-mdc-button-base {
  height: 48px !important;
  width: 48px !important;
}
```

### 8.4 Remap colori inline (dinamici) — case-insensitive, no short hex, formato rgb

```scss
// Mappe + @each per rimappare i colori applicati INLINE dal componente
$bg-remap: ('#f5f5f5': var(--pl-bg-page), '#ffffff': var(--pl-bg-surface));

.dark-mode {
  @each $light, $dark in $bg-remap {
    // flag `i` → attributo case-insensitive (le palette sono spesso maiuscole)
    [style*='background: #{$light}' i],
    [style*='background:#{$light}' i] { background: $dark !important; }
  }
}

// ATTENZIONE: il browser normalizza spesso in rgb() → servono mappe separate
// [style*='background: rgb(245, 245, 245)'] { ... }
// e NON usare hex corti (#000 matcha come substring #0000CD): solo 6 cifre.
```

### 8.5 Componenti a Shadow DOM (Ionic) → CSS custom properties

```scss
.dark-mode {
  ion-checkbox {
    --checkbox-background: transparent;
    --checkbox-background-checked: var(--pl-accent);
    --border-color: var(--pl-border-accessible);
    --checkmark-color: #fff;
  }
  // chip/badge di stato: sia --background (shadow) sia background diretto
  ion-chip.status-ok {
    --background: linear-gradient(180deg, #2a7d4f 0%, #1f6b42 100%) !important;
    background: linear-gradient(180deg, #2a7d4f 0%, #1f6b42 100%) !important;
    color: #fff !important;
    & * { color: #fff !important; }
  }
}
```

### 8.6 Icone: antialiasing, SVG inline, `<img>` SVG

```scss
.dark-mode {
  // "bold" in dark = rendering sub-pixel → antialiasing. MAI font-weight.
  i, .fa, .fas, mat-icon, .material-icons, ion-icon {
    -webkit-font-smoothing: antialiased !important;
    -moz-osx-font-smoothing: grayscale !important;
  }
  // SVG inline con fill scuro hardcoded (anche via [innerHTML])
  svg [fill='#333333'], svg [fill='#333'], svg [fill='grey'] {
    fill: var(--pl-icon-fg) !important;
  }
  // <img> SVG: invertire SOLO le varianti a box chiaro; le già-scure NO.
  img[src*='icon-light-box'] { filter: invert(1) !important; }
  img[src*='icon-dark-box']  { filter: none !important; }
}
```

Nota: due SVG **inversi tra loro** (box bianco+segno nero vs box nero+segno
bianco) non possono condividere lo stesso filtro → distinguerli per pattern.

### 8.7 Header sticky delle tabelle — bleed durante lo scroll

Sintomo: durante lo scroll con momentum il contenuto trapela sopra l'header
sticky. Se `elementFromPoint` sull'header restituisce l'header (in hit-test è
sopra) ma visivamente trapela, è un **glitch di compositing**, non di stacking.

```scss
// Fix: slot header/filtri = barriere opache SOPRA il corpo tabella.
// (Il padding-top o la sola promozione a layer dell'header NON bastano.)
:host-context(.app-v2) .page {
  > .header-slot, > .filter-slot {
    position: relative; z-index: 3; background-color: var(--bg-color);
  }
  > .body-slot { position: relative; z-index: 1; }
}
```

### 8.8 Workflow di verifica su dev server live

- Dopo un edit SCSS attendere il recompile (~6-9s); la **prima misura è spesso
  pre-recompile (stale)**. Gli edit ai partial possono forzare un reload →
  ri-applicare la classe di tema via JS dopo.
- Confermare che una regola sia compilata iterando `document.styleSheets →
  cssRules` e cercando il `cssText`.
- Distinguere **stacking** (`elementFromPoint`) da **paint/compositing**
  (visibile solo a schermo/scroll).
- Verificare pagine con tabelle a **più risoluzioni** (1366×768, 1920×1080,
  2560×1440): scroll interno, scrollbar orizzontale, paginatore sempre visibile.
- Le librerie in `projects/` (build separate) possono avere hot-reload più lento.

