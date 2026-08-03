# Angular Component Extractor — Senior Angular Architect

> **Scopo**: Reverse-engineering di HTML sorgente verso architettura Angular 17-19+ con NgModule, NgRx, pl-dynamicform e Material. Production-ready.

---

## 1. WORKFLOW

### A — Scansione navigazione
Leggi il file HTML. Individua sezioni navigabili (nav, sidebar, tab, route JS). Produci `sections-map.json`:
```json
{ "sourceFile": "...", "sections": [{ "id": "...", "name": "...", "type": "page-section|tab|modal-trigger", "htmlPreview": "200 chars" }] }
```

### B — Estrazione sezione
Leggi `angular-gen-config.json` per selector + outputPath. Copia HTML + classi CSS + variabili CSS. Produci `extracted-section.json`.
> outputPath = `workspace/output/test-app/src/libs/{featureName}`. NON toccare `app-routing.module.ts` o `app.module.ts`.

### C — Decomposizione
1 responsabilità = 1 componente. Max 150 righe HTML. Ogni `@for` ripetuto = componente figlio. Produci `component-map.json`.

### D — Generazione
Genera tutti i file secondo la struttura qui sotto.

### E — Report
Scrivi `generation-report.md` con: componenti generati, mapping SCSS→token, TODO per il team.

---

## 2. ARCHITETTURA ANGULAR

### Struttura file
```
{featureName}/
├── index.module.ts          ← {FeatureName}Module — include StoreModule.forFeature
├── index-routing.module.ts
├── index.guard.ts           ← {FeatureName}Guard → nei providers del NgModule
├── index.service.ts         ← {FeatureName}Service → nei providers del NgModule
├── index.models.ts          ← tutte le interfacce/type della feature
├── index.component.ts/html/scss
├── components/{sub}/
├── dialogs/{name}/
├── mock-data/{feature}.mock.ts
└── redux/                   ← state, actions, reducer, selectors, effects, store.module, index
```

### NgModule lib (obbligatorio)
```typescript
@NgModule({
  declarations: [FeatureComponent /*, tutti i sub-component e dialog */],
  imports: [
    CommonModule, ReactiveFormsModule,
    StoreModule.forFeature(featureKey, featureReducer),
    EffectsModule.forFeature([FeatureEffects]),
    /* SOLO i MatModule effettivamente usati */
  ],
  exports: [FeatureComponent],
  providers: [FeatureGuard, FeatureService],  // OBBLIGATORIO (no providedIn:'root')
})
export class FeatureModule {}
```
> Il modulo app-side importa SOLO `FeatureModule`. NgRx è già dentro — MAI duplicare `StoreModule.forFeature`.

### NgRx (redux/)
```typescript
// state.ts
export const featureKey = '{featureName}' as const;
export interface FeatureState { items: T[]; loading: boolean; error: string | null; }
export const initialState: FeatureState = { items: [], loading: false, error: null };

// actions.ts — createActionGroup
export const FeatureActions = createActionGroup({ source: '{Feature}', events: {
  'Load Items': emptyProps(),
  'Load Items Success': props<{ items: T[] }>(),
  'Load Items Failure': props<{ error: string }>(),
}});

// reducer.ts — export camelCase: featureReducer (NON FeatureReducer)
// selectors.ts — createFeatureSelector + createSelector
// effects.ts — switchMap + catchError
// {feature}-store.module.ts — NgModule esportabile con StoreModule.forFeature + EffectsModule.forFeature
```

### Mock service (sviluppo) — predisposto per switch BE zero-code

Il service deve essere predisposto per il switch mock→backend **senza toccare componenti, effects, reducer o selettori**. Usare il pattern `InjectionToken` + `HttpClient`:

```typescript
// index.service.ts
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Token opzionale: se non fornito → mock; se fornito → http
export const FEATURE_API_BASE_URL = new InjectionToken<string>('FEATURE_API_BASE_URL');

@Injectable()
export class FeatureService {
  constructor(
    private readonly http: HttpClient,
    @Optional() @Inject(FEATURE_API_BASE_URL) private readonly apiBaseUrl: string | null
  ) {}

  getItems(): Observable<T[]> {
    // ✅ MOCK (default — nessun backend richiesto)
    return of(FEATURE_MOCK);
    // 🔌 BACKEND — sostituire la riga sopra con:
    // return this.http.get<T[]>(`${this.apiBaseUrl}/items`);
  }
}
```

```typescript
// index.module.ts — aggiungere HttpClientModule agli imports
imports: [CommonModule, HttpClientModule, ReactiveFormsModule, ...]
```

**Attivazione backend (solo nel modulo consumer, zero modifiche alla lib):**
```typescript
// AppModule o feature.module.ts del progetto consumer
providers: [
  { provide: FEATURE_API_BASE_URL, useValue: environment.featureApiUrl }
]
```

**Regola**: il service è chiamato SOLO da `redux/{feature}.effects.ts`. Mai iniettarlo nei componenti.

### Template HTML (Angular 17+)
- VIETATO: `*ngFor`, `*ngIf`, `*ngSwitch`
- OBBLIGATORIO: `@for ... track`, `@if`, `@switch`, `@defer`
- `@for` DEVE avere `track`: `@for (item of items; track item.id)`

### Routing multi-vista con ActivatedRoute.data

Quando un singolo componente gestisce più viste logiche (es. elenco/storico) usa `ActivatedRoute.data`:

```typescript
// index.component.ts
readonly view$ = this.route.data.pipe(map(d => d['view'] as 'elenco' | 'storico'));
```

Il routing **app-side** DEVE dichiarare le route figlie con `data.view`:

```typescript
// ❌ SBAGLIATO: route piatta senza data → view$ = undefined → la vista storico non si attiva mai
const routes = [{ path: '', component: IndexComponent }];

// ✅ CORRETTO: route figlie con data.view
const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'elenco' },
  { path: 'elenco',  component: IndexComponent, canActivate: [Guard], data: { view: 'elenco' } },
  { path: 'storico', component: IndexComponent, canActivate: [Guard], data: { view: 'storico' } },
];
```

> **Regola**: se `IndexComponent` usa `this.route.data['view']`, il routing app-side DEVE avere  
> child routes con `data: { view: 'xxx' }`. Route piatta `path: ''` → `view$` emette `undefined` → componente bloccato sulla vista di default.

```html
<!-- index.component.html — switch view con @if -->
@if ((view$ | async) === 'elenco') { <section class="report-page__view--elenco">...</section> }
@if ((view$ | async) === 'storico') { <section class="report-page__view--storico">...</section> }
```

In `ngOnInit`, il dispatch degli action NgRx dipende dalla vista attiva:
```typescript
this.view$.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(view => {
  if (view === 'storico') this.store.dispatch(FeatureActions.loadStorico());
});
```

### ⚠️ REGOLA: la lib NON deve importare il suo routing module

Il `LibModule` (es. `ReportModule`) non deve dichiarare `RouterModule.forChild` nel proprio `@NgModule.imports`.  
Il routing appartiene all'applicazione consumer, NON alla libreria.

```typescript
// ❌ SBAGLIATO: LibModule importa il suo routing → conflitto con il routing del consumer
@NgModule({
  imports: [CommonModule, LibRoutingModule, ...],   // ← LibRoutingModule qui è sbagliato
  exports: [IndexComponent],
})
export class LibModule {}

// ✅ CORRETTO: LibModule senza routing, solo store + componenti
@NgModule({
  imports: [CommonModule, LibStoreModule, /* NO LibRoutingModule */],
  exports: [IndexComponent],
})
export class LibModule {}
```

```typescript
// ✅ Il consumer (app/feature.module.ts) aggiunge le route con data.view:
@NgModule({
  imports: [SharedModule, AppSideRoutingModule, LibModule],
})
export class FeatureModule {}
```

> Se la lib ha un `index-routing.module.ts`, usarlo SOLO come DOCUMENTAZIONE delle route suggerite,  
> non importarlo direttamente nella lib. Il consumer copia quelle route nel proprio routing module.

### HTML nativo vs Angular Material
Usa HTML nativo (classi CSS del sorgente) quando l'elemento ha styling custom.  
Usa Material per input generici senza CSS custom.

| HTML NATIVO | ANGULAR MATERIAL |
|---|---|
| Tab custom, card custom, accordion custom | `<mat-form-field>` + `<input matInput>` |
| Button con classi CSS originali | `<mat-select>`, `<mat-table>`, `<mat-paginator>` |
| Status badge custom | `<mat-dialog>`, `<mat-datepicker>` |

---

## 3. FIDELITÀ VISIVA

### Confronto obbligatorio prima di consegnare
Diff > 2px = bug. Screenshot sorgente vs implementazione su ogni stato.

### NON aggiungere elementi non nel sorgente
- Badge contatori (es. "0/8 compilati") — solo se il sorgente li ha
- Icone freccia sui bottoni (es. `<` su "Indietro") — solo se nel sorgente
- `max-height + overflow-y:auto` — solo se il sorgente ha scroll
- `@if (count > 0)` su badge — se il sorgente mostra "0", mostrarlo sempre

### ⚠️ REGOLE IMPERATIVE — Badge, Elementi interattivi, CSS classi

#### 1. Badge sempre visibile — NO @if sul count
```html
<!-- ❌ SBAGLIATO: nasconde il badge quando count=0, devia dal sorgente -->
@if (myItems.length > 0) {
  <span class="ts-tab-badge">{{ myItems.length }}</span>
}

<!-- ✅ CORRETTO: il sorgente mostra "0" — il badge è SEMPRE presente -->
<span class="ts-tab-badge">{{ myItems.length }}</span>
```

#### 2. Elementi cliccabili = `<button>` (mai `<div>`)
```html
<!-- ❌ SBAGLIATO: div con (click) — nessun comportamento nativo, fail accessibility -->
<div class="report-card" (click)="onClick()">...</div>

<!-- ✅ CORRETTO: card cliccabile è un <button> nativo -->
<button type="button" class="report-card" (click)="onClick()">...</button>
```
> Regola: ogni elemento "card", "accordion header", "tab" che ha un `(click)` DEVE essere `<button type="button">`.  
> Eccezione: se il sorgente usa `<div>` non cliccabile (solo container), mantenerlo `<div>`.

#### 3. CSS classi identiche al sorgente — confronto esatto
| Sorgente | ✅ Usa | ❌ Non usare |
|----------|--------|-------------|
| `.is-open` sul cat-header accordion | `[class.is-open]="expanded"` | `[class.open]="expanded"` |
| `.open` sul cat-body accordion | `[class.open]="expanded"` | `[class.is-open]="expanded"` |
| `.ts-tab.active` per tab attivo | `[class.active]="activeTab === 'x'"` | `[class.selected]` |
| `.btn.btn-outline-primary` per bottone outline | classi native CSS | `mat-stroked-button` |
| `.card-preset-badge` chip "Preimpostato" | classe CSS nativa | `<mat-chip>` |
| `.cat-badge` contatore "N report preimpostati" | classe CSS nativa | `<mat-badge>` |

#### 4. Storico table — classi colonne esatte
```html
<!-- Colonne storico: le classi CSS dalla reference DEVONO essere usate per applicare le larghezze -->
<ng-container matColumnDef="dataRichiesta">
  <th mat-header-cell *matHeaderCellDef class="col-data">Data richiesta</th>
  <td mat-cell *matCellDef="let row" class="col-data">{{ row.dataRichiesta }}</td>
</ng-container>
<!-- col-data | col-template | col-file | col-ver | col-dim | col-fmt | col-stato | col-azioni -->
```

#### 5. Empty state obbligatorio per tab "I miei report"
```html
<!-- Quando activeTab === 'miei' e myReports.length === 0 -->
@if (activeTab === 'miei' && myReports.length === 0) {
  <div class="ts-empty-state">
    <span class="ts-empty-icon">...</span>
    <p class="ts-empty-title">Nessun report salvato</p>
    <p class="ts-empty-desc">Crea un report personalizzato dalla scheda "Report preimpostati"</p>
  </div>
}
```

### Checklist
```
□ Dialog: width:100% sul componente interno (NON pixel fissi → overflow ~34px)
□ Nessuna scrollbar dove il sorgente non ne ha
□ Mock data: stesso numero di voci (tabella, fieldGroups, filter options)
□ Bottoni: stesso testo + icone (non aggiungere frecce non presenti)
□ Accordion body: aggiungere .open se il design system usa display:none/.open{display:block}
□ Step bar: done=verde, active=colore primario, pending=grigio
□ Stato badge: testo IDENTICO al sorgente (es. "In progress" NON "In elaborazione")
□ Badge contatori (ts-tab-badge): SEMPRE visibili anche con count=0, mai @if (count > 0)
□ Card cliccabile: <button class="report-card"> NON <div class="report-card">
□ Tab attivo: [class.active] — mai [class.selected] o [class.is-active]
□ Accordion open: cat-header usa .is-open, cat-body usa .open (non incrociare)
□ Empty state: .ts-empty-state quando la lista è vuota (NON solo nascondere il blocco)
```

### Mock data: dati ESATTI dal sorgente
Cerca costanti JS nel `<script>` del file HTML. Copia valori esatti. `items.length` e `fields.length` devono corrispondere al sorgente.

### SCSS design system
```scss
@use '@angular/material' as mat;
@use '{path}/design-system/main';  // DOPO @use Material
```

**Angular Material 19 — Sass API (prefisso m2-):**
```scss
mat.define-palette         → mat.m2-define-palette
mat.\-palette          → mat.\-gray-palette
mat.define-light-theme     → mat.m2-define-light-theme
mat.define-typography-config → mat.m2-define-typography-config
```

---

## 4. ANGULAR MATERIAL — DIALOG

### REGOLA FERREA: panelClass = .cdk-overlay-pane (NON mat-dialog-container)

`cdk-overlay-pane` ha di default `border: 1px solid rgb(224,224,224)` + `background: rgb(250,250,250)`.  
**Il bordo grigio visibile all'utente viene da .cdk-overlay-pane.**

```scss
/* styles.scss */

/* Backdrop */
.cdk-overlay-dark-backdrop.cdk-overlay-backdrop-showing {
  background: rgba(0, 0, 0, 0.5) !important;  /* default per dialog su sfondi neutri */
}
.my-intense-backdrop.cdk-overlay-backdrop-showing {
  background: rgba(0, 0, 0, 0.72) !important;  /* per dialog su pagine con colori vivaci */
}

/* Dialog panel — panelClass applicato al .cdk-overlay-pane */
.my-dialog-panel {
  border: none !important;            /* rimuove bordo grigio del cdk-overlay-pane */
  background: transparent !important;
  outline: none !important;

  .mat-mdc-dialog-container .mdc-dialog__container .mdc-dialog__surface {
    border: none !important; outline: none !important;
    border-radius: {DAL SORGENTE} !important;
    padding: 0 !important;  overflow: hidden !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.24), 0 2px 8px rgba(0,0,0,0.12) !important;
    /* Shadow > 20px crea effetto "secondo dialog" visivo → tenere contenuta */
  }
  .mat-mdc-dialog-container { padding: 0 !important; border: none !important; background: transparent !important; }
}
```

```typescript
this.dialog.open(MyDialogComponent, {
  width: '{larghezza}', maxWidth: '95vw', maxHeight: 'calc(100vh - 48px)',
  panelClass: 'my-dialog-panel',
  backdropClass: 'my-intense-backdrop',  // solo se background pagina è colorato
  data,
});
```

### Componente dialog: SEMPRE width:100%
```scss
/* ❌ SBAGLIATO: overflow ~34px (Angular Material crea container 34px < del valore) */
.my-dialog { width: min(860px, 95vw); }

/* ✅ CORRETTO */
.my-dialog { width: 100%; max-height: calc(100vh - 48px); display: flex; flex-direction: column; overflow: hidden; }
```

### Accordion body con design system
```
<!-- ❌ @if da solo non basta se CSS ha: .elem { display:none } + .elem.open { display:block } -->
@if (isOpen) { <div class="acc-body" [formGroup]="form">...</div> }

<!-- ✅ Aggiungere .open per display:block del design system -->
@if (isOpen) { <div class="acc-body open" [formGroup]="form">...</div> }
```
> Debug: `getComputedStyle(el).display === 'none'` nonostante elemento nel DOM → cercare in `styles.css` il selettore con `display:none` + variante `.open`.

---

## 5. pl-dynamicform — Riferimento Completo

> **Richiede Angular 19+** (usa `linkedSignal`). NON compatibile con Angular 17/18.

### Setup
```bash
npm install pl-dynamicform ux-directives moment @angular/material-moment-adapter @ionic-native/camera @ionic-native/core @ionic/angular capacitor-document-scanner @capacitor/core --legacy-peer-deps
npm install bootstrap --save-dev
```
```typescript
// app.module.ts
@NgModule({
  imports: [PlDynamicFormModule],
  providers: [...provideDynamicFormForModule({ matFormField: { appearance: 'outline', floatLabel: 'always' } })],
})
// feature.module.ts
@NgModule({ imports: [..., PlDynamicFormModule] })
```

### Upgrade Angular 17→19 (necessario per pl-dynamicform)
```bash
ng update @angular/core@18 @angular/cli@18 --allow-dirty --force
ng update @angular/core@19 @angular/cli@19 --allow-dirty --force
npm install @angular/material@19 @angular/cdk@19 --legacy-peer-deps
```
Post-migration: rimuovere `HttpClientModule` dagli `exports` di SharedModule (sostituito da `provideHttpClient()`).

### Workflow build (OBBLIGATORIO — sequenziale)
```bash
npx ng build {lib-name} --configuration=development  # attendi completamento
npx ng serve --port 4200                              # poi avvia

# ng serve NON rileva modifiche al dist/ della lib → kill serve → build → serve
```

### ⚠️ Stili CDK overlay: non possono stare nei component SCSS

Angular CDK inietta `.cdk-overlay-pane`, `.cdk-overlay-backdrop`, `panelClass` e `backdropClass` direttamente nel `<body>`, **fuori dall'albero dei componenti Angular**. Non sono raggiungibili né da component SCSS (ViewEncapsulation) né da `::ng-deep`.

**Soluzione per librerie self-contained**: creare `_lib-name.theme.scss` nella lib e importarlo nel consumer.

### ⚠️ SCSS deve stare nella lib, non nella webapp

I design token e le CSS custom properties della feature devono essere **nella libreria stessa**, non nella webapp consumer:

```
projects/lib-{name}/
  src/
    _tokens.scss          ← SCSS variables + mixin host-properties
    lib/
      lib-{name}.theme.scss  ← CSS globale (CDK overlay + :root custom props)
      index.component.scss   ← @include tokens.host-properties (unica chiamata)
      components/**          ← @use '../../../tokens' as tokens; + var(--nome)
```

**`_tokens.scss`** — unica fonte di verità per la feature:
```scss
// Breakpoint responsive
$bp-xl: 1180px; $bp-lg: 900px; $bp-sm: 680px; $bp-xs: 440px;

// Design token (estratti dai CSS custom properties del sorgente HTML)
$color-primary: #3b5ccc;
$color-bg: #f5f7fb;
// ... tutti i token del sorgente

// Mixin: emette CSS custom properties su :host
// Chiamato SOLO da index.component.scss — i figli le ereditano via cascata
@mixin host-properties {
  --primary: #{$color-primary};
  --bg: #{$color-bg};
  // ... tutti i token
}
```

**`index.component.scss`** — applica i token sul :host:
```scss
@use '../../tokens' as tokens;
:host {
  display: block;
  @include tokens.host-properties;  // ← unica chiamata al mixin
}
```

**`components/*.component.scss`** — usa solo `var()` CSS, non hardcoded:
```scss
@use '../../../tokens' as tokens;  // path relativo dalla profondità del componente
.card { border-radius: var(--radius); background: var(--surface); }
@media (max-width: tokens.$bp-sm) { ... }  // breakpoint SCSS via tokens
```

**Importante**: la lib-{name}.theme.scss va importata nel `styles.scss` del consumer:
```scss
// styles.scss
@use '../projects/lib-{name}/src/lib/lib-{name}.theme';  // CSS globale della lib
```

```scss
/* projects/lib-name/src/lib/lib-name.theme.scss */
// Il consumer aggiunge in styles.scss:
//   @use '../projects/lib-name/src/lib/lib-name.theme';

.my-dialog-panel {                       // panelClass = .cdk-overlay-pane
  border: none !important;
  background: transparent !important;
  .mat-mdc-dialog-container .mdc-dialog__container .mdc-dialog__surface {
    padding: 0 !important; overflow: hidden !important;
    border-radius: 12px !important; border: none !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.24), 0 2px 8px rgba(0,0,0,0.12) !important;
  }
  .mat-mdc-dialog-container { padding: 0 !important; border: none !important; background: transparent !important; }
}
.cdk-overlay-dark-backdrop.cdk-overlay-backdrop-showing { background: rgba(0,0,0,0.5) !important; }
.my-intense-backdrop.cdk-overlay-backdrop-showing { background: rgba(0,0,0,0.72) !important; }
```

```scss
/* styles.scss del consumer — unica riga necessaria per la lib */
@use '../projects/lib-name/src/lib/lib-name.theme';
```

### Tipi TYPE_CONTROL_FORM
| Tipo | Uso | Note |
|------|-----|------|
| `TEXT` | Input testo | |
| `COMBO` | Select/multiselect | `options: Signal<{id,description}[]>`, `multiple`, `keyCombo` |
| `DATA` | Date picker singolo | |
| `DATARANGE` | Date range picker | |
| `CHECKBOX` | Checkbox booleano | ⚠️ `class[]` IGNORATO — usa CSS diretto |
| `TEXTAREA` | Multi-riga | |
| `NUMBER` | Numerico | |
| `BUTTON` | Pulsante | Non funziona inline → usa button nativo esterno |

### Builder
```typescript
const config: ConfigForm = DynamicFormBuilder.create({})
  .addGroup('', ['row', 'g-0'], 'group-id')
  .addForm({ formName: 'nome', title: 'Label', type: TYPE_CONTROL_FORM.TEXT,
    formControl: new FormControl(null), class: ['col-6'] })
  .addForm({ formName: 'stato', type: TYPE_CONTROL_FORM.COMBO,
    formControl: new FormControl(null), options: signal([{ id: 'a', description: 'A' }]),
    multiple: false, resetButton: false, keyCombo: { keyId: 'id', keyDescription: 'description' }, class: ['col-6'] })
  .addActions([{ label: 'Seleziona tutti', visible: true,
    action: (questions: Form[]) => {
      const all = questions.every(q => q.formAction.formControl?.value === true);
      questions.forEach(q => (q.formAction.formControl as FormControl)?.setValue(!all));
    }
  } as DynamicFormActionButton])
  .build();
```

### completionChange
```typescript
onCompletion(s: FormCompletionStats) {
  // s.total = campi totali, s.filled = non-vuoti (checkbox = numero di checked), s.percentage = 0-100
  this.count = s.filled;
}
```

---

### ⚠️ STRUTTURA DOM INTERNA (non reinvestigare)

```
dynamic-form → .df-form → .row.g-0 (level 1, wrapper gruppi)
  → .g-0.row (level 2, gruppo — da addGroup)
    ├── .row.mb-4.g-1.ps-1 → .form-title.fs-13  (titolo)
    └── .row.g-0 (level 3 — CONTENITORE CAMPI ← target CSS per layout)
        ├── app-input-text.scaled  ← TEXT (class[] funziona)
        ├── app-combo.scaled       ← COMBO (class[] funziona)
        ├── app-date.scaled        ← DATA (class[] funziona)
        ├── app-date-range.scaled  ← DATARANGE (class[] funziona)
        └── app-checkbox.scaled    ← CHECKBOX (class[] IGNORATO!)
```

### ⚠️ LIMITAZIONE CHECKBOX: class[] ignorato → usare CSS diretto

```scss
/* Layout 2-colonne CHECKBOX */
.my-section {
  ::ng-deep dynamic-form .df-form > .row > .row > .row { display: flex !important; flex-wrap: wrap !important; }
  ::ng-deep app-checkbox { width: 50% !important; padding-right: 12px; box-sizing: border-box; margin-bottom: 3px; }
}

/* Layout 2-colonne TEXT/COMBO/DATA — selettore a 3 livelli (obbligatorio) */
::ng-deep dynamic-form .df-form > .row > .row > .row {
  display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 16px 20px !important;
}
/* ❌ SBAGLIATO: 2 livelli → colpisce il gruppo, non i campi */
/* ❌ SBAGLIATO: .df-form .row.g-0 .row.g-0 → tutti i livelli, gruppi side-by-side */
/* ❌ SBAGLIATO: dynamic-form .row → troppo generico */
```

### Override mat-form-field (compatto, sorgente-matching)
```scss
::ng-deep .mat-mdc-form-field {
  --mdc-outlined-text-field-container-shape: 6px;
  --mdc-outlined-text-field-outline-color: {FIELD_BORDER};
  --mdc-outlined-text-field-focus-outline-color: {PRIMARY};
  --mdc-outlined-text-field-label-text-size: 10px;
  --mdc-outlined-text-field-label-text-weight: 500;
  --mdc-outlined-text-field-input-text-size: 12px;
  .mat-mdc-form-field-infix { padding-top: 6px !important; padding-bottom: 6px !important; min-height: 36px !important; }
  .mat-mdc-text-field-wrapper { padding-bottom: 0 !important; }
  &.mat-form-field-disabled { opacity: 0.45; }
}
```

### Override mat-checkbox (stile checkbox nativo sorgente)
```scss
.my-section {
  ::ng-deep mat-checkbox .mdc-checkbox { width: 16px !important; height: 16px !important; padding: 0 !important; }
  ::ng-deep mat-checkbox .mat-mdc-checkbox-touch-target,
  ::ng-deep mat-checkbox .mdc-checkbox__ripple,
  ::ng-deep mat-checkbox .mat-ripple { display: none !important; }
  ::ng-deep mat-checkbox .mdc-checkbox__background {
    width: 16px !important; height: 16px !important; border-radius: 4px !important;
    border-width: 1.5px !important; border-color: {CHECKBOX_BORDER} !important; top: 0 !important; left: 0 !important;
  }
  ::ng-deep mat-checkbox.mat-mdc-checkbox-checked .mdc-checkbox__background {
    background-color: {PRIMARY} !important; border-color: {PRIMARY} !important;
  }
  ::ng-deep mat-checkbox .mdc-label { font-size: 12px !important; padding-left: 8px !important; }
}
```

---

### Pattern: Accordion con dynamic-form per gruppo (CHECKBOX + completionChange)

```typescript
// Builder per singolo gruppo
export function buildGroupForm(fields: Field[], controls: Record<string, FormControl>): ConfigForm {
  const b = DynamicFormBuilder.create({}).addGroup('', ['row', 'g-0']);
  fields.forEach(f => b.addForm({
    formName: f.id, title: f.label, type: TYPE_CONTROL_FORM.CHECKBOX,
    formControl: controls[f.id] ?? new FormControl(false),
  }));
  return b.build();
}

// Component
groupConfigs: Record<string, ConfigForm> = {};
groupCounts:  Record<string, number> = {};
onGroupCompletion(key: string, s: FormCompletionStats) { this.groupCounts = { ...this.groupCounts, [key]: s.filled }; }
get totalSelected() { return Object.values(this.groupCounts).reduce((a, b) => a + b, 0); }
```

```
@for (group of groups; track group.key) {
  <div class="group">
    <button class="group-header" (click)="toggle(group.key)">
      <span class="chevron" [class.open]="isOpen(group.key)"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span>
      <span>{{ group.label }}</span>
      <label (click)=".stopPropagation(); toggleAll(group)">
        <span class="chk" [class.checked]="isAllSelected(group)"><svg viewBox="0 0 9 7"><path d="M1 3l2.5 2.5L8 1"/></svg></span> Tutti
      </label>
    </button>
    @if (isOpen(group.key)) {
      <div class="group-body">
        <dynamic-form [config]="groupConfigs[group.key]" (completionChange)="onGroupCompletion(group.key, )"></dynamic-form>
      </div>
    }
  </div>
}
```

---

### Pattern: Filter bar orizzontale + Reset nativo

```typescript
// g-0 + flex-nowrap (NON g-2: aggiunge padding → wrapping prematuro)
DynamicFormBuilder.create({})
  .addGroup('', ['row', 'g-0', 'flex-nowrap'])
  .addForm({ formName: 'from', title: 'Da', type: TYPE_CONTROL_FORM.DATA, formControl: fc, class: ['col-auto'] })
  .addForm({ formName: 'stato', title: 'Stato', type: TYPE_CONTROL_FORM.COMBO, formControl: fc2,
    options: opts, multiple: true, resetButton: false, class: ['col-auto'], keyCombo: { keyId: 'id', keyDescription: 'description' } })
  .build();
```

```
<!-- addActions() renderizza .df-actions-group in riga separata → NON usabile inline -->
<!-- Bottone Reset NATIVO come sibling di dynamic-form -->
<div class="filter-bar">
  <dynamic-form [config]="config"></dynamic-form>
  <button type="button" class="reset-btn" (click)="onReset()">Reset</button>
</div>
```

```scss
.filter-bar {
  display: flex; flex-wrap: wrap; align-items: flex-end;
  ::ng-deep dynamic-form .df-form > .row > .row > .row {
    display: flex !important; flex-wrap: nowrap !important; gap: 12px !important; align-items: flex-end !important;
  }
  /* Larghezze per tipo di campo */
  ::ng-deep dynamic-form app-date       { width: 160px !important; flex-shrink: 0; }
  ::ng-deep dynamic-form app-combo      { width: 150px !important; flex-shrink: 0; }
  ::ng-deep dynamic-form app-input-text { width: 180px !important; flex-shrink: 0; }
  ::ng-deep dynamic-form .df-actions-group,
  ::ng-deep dynamic-form .form-title { display: none !important; }

  /* ⚠️ OBBLIGATORIO: mat-datepicker-toggle ha mat-icon-button MDC default 40-44px             */
  /* → forza il form field ad essere più alto degli altri campi (COMBO/TEXT restano a 36px)     */
  /* Applicare a app-date E app-date-range (stessa struttura interna MDC)                       */
  ::ng-deep dynamic-form app-date,
  ::ng-deep dynamic-form app-date-range {
    .mat-mdc-form-field-icon-suffix { padding: 0 2px 0 0 !important; align-self: center !important; }
    .mat-mdc-icon-button.mat-mdc-button-base {
      width: 28px !important; height: 28px !important;
      padding: 0 !important; line-height: 28px !important;
    }
    .mat-mdc-icon-button .mat-mdc-button-touch-target { width: 28px !important; height: 28px !important; }
    .mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }
  }
}
.reset-btn { background: none; border: none; font-size: 12px; cursor: pointer; align-self: flex-end; padding: 8px 4px; }
```

---

## 6. ANATOMIA DEL PRODOTTO — Classi CSS di riferimento

> Questa sezione documenta le classi CSS estratte dal sorgente HTML reference (TimeVision v11).  
> Usarle INVARIATE nei template Angular. Non rinominarle, non sostituirle con classi Material.

### Elenco report — Struttura catalogo

```
.report-page                    → root del feature component
  .sub-header                   → intestazione pagina (H1 + P)
  .categories-container         → loop di lib-report-category

lib-report-category:
  .cat-card[.cat-card--open]    → wrapper categoria
    button.cat-header[.is-open] → header cliccabile (accordion toggle)
      .cat-header-left
        .cat-header-chevron     → SVG chevron
        .cat-icon               → mat-icon
        .cat-label              → testo categoria
        .cat-badge              → "N report preimpostati"
    .cat-body[.open]            → body (display:none → .open { display:block })
      lib-report-sub-section (per ogni subSection)

lib-report-sub-section:
  .sub-section
    .ts-sub-header
      .ts-header-left
        .ts-section-name        → nome sotto-sezione (es. "PERIODO CORRENTE")
        .ts-tabs
          button.ts-tab[.active]  → "Report preimpostati"
          button.ts-tab[.active]  → "I miei report" + span.ts-tab-badge (SEMPRE visibile)
      button.btn.btn-outline-primary → "Personalizza nuovo report"
    .cards-grid                 → grid 3 colonne, solo in tab preimpostati
      lib-report-preset-card    → ogni card
    lib-report-my-reports-panel → tab "I miei report"
      .ts-empty-state           → se myReports.length === 0
        .ts-empty-icon + .ts-empty-title + .ts-empty-desc

lib-report-preset-card:
  button.report-card            → DEVE essere <button> (NON <div>)
    .card-top-row
      .card-icon                → SVG documento
      .card-preset-badge        → "Preimpostato" (chip)
    .card-title                 → nome report
    .card-desc                  → descrizione
    .card-action
      span.card-dl-btn          → "Gestisci report" (nel sorgente è <span>, non <button>)
```

### Storico report — Struttura tabella

```
.storico-container
  lib-report-storico-filter-bar
    .storico-filter-bar         → filtri inline
      .field-wrap               → ogni filtro: .field-label + input/select .field-input
      button.storico-reset-btn  → "Reset"
  mat-table.storico-table dentro .storico-table-wrap
    Colonne (matColumnDef):
      dataRichiesta  → th/td.col-data
      template       → th/td.col-template
      nomeFile       → th/td.col-file    (troncato con text-overflow)
      versione       → th/td.col-ver
      dimensione     → th/td.col-dim
      formato        → th/td.col-fmt     (chip .storico-fmt con .fmt-xlsx / .fmt-csv)
      stato          → th/td.col-stato   (lib-report-storico-status-badge)
      azioni         → th/td.col-azioni  (.storico-actions con eye + download button)
  mat-paginator                 → "Items per page" + "1 – N of M"
```

### Wizard dialog — Struttura modale

```
MatDialog aperto con:
  panelClass: 'wizard-panel'    → gestito da lib-report.theme.scss
  backdropClass: 'wizard-overlay'

lib-report-wizard-dialog:
  .wizard-dialog               → width:100% (NON pixel fissi!)
    .modal-header (step 1: filtri) / section.modal-preview-header (step 2: preview)
      .modal-title-icon        → icona categoria
      .modal-title-text
        h2.modal-title         → nome report
        p.modal-subtitle       → "Categoria — SubSezione"
      button.modal-close-btn   → ×
    .modal-body / .modal-preview-body
      [step 1: filtri]  → dynamic-form con i filtri configurabili
      [step 2: preview] → .modal-preview-cols + mat-table preview + nota disclaimer
    footer con step-bar + azioni:
      .step-bar                → ol con li[.active|.done|.pending]
      button "Indietro"        → solo in step > 1
      button "Avanti" (step 1) / buttons download (step 2)
```

### Storico detail dialog — Struttura modale

```
MatDialog aperto su click riga storico:
  panelClass: 'storico-detail-panel'

lib-report-storico-detail-dialog:
  .storico-modal               → width:100%
    .modal-header (con "—" se title non disponibile)
    .modal-body
      .detail-grid             → Dettagli richiesta
        .detail-lbl / .detail-val → coppie label/valore
      accordion "Filtri applicati"   → .is-open toggle
      accordion "Colonne incluse"    → .is-open toggle
```

### Status badge storico — Valori esatti

| Stato mock | Classe CSS | Colore |
|---|---|---|
| `pronto` | `.stato-pronto` | verde |
| `scaricato` | `.stato-scaricato` | grigio |
| `in-elaborazione` | `.stato-in-elaborazione` | giallo/amber |
| `fallito` | `.stato-fallito` | rosso |
| `scaduto` | `.stato-scaduto` | arancione |
| `accettato` | `.stato-accettato` | azzurro |

> Il testo visibile è capitalizzato: "Pronto", "Scaricato", "In progress" / "In elaborazione", "Fallito", "Scaduto", "Accettato".
