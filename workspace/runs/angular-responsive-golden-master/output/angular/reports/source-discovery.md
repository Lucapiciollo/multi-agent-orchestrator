# Phase 0 — Source Discovery

**Run:** `angular-responsive-golden-master`
**Step:** `step-00-source-discovery`
**Modalità:** sola lettura — nessuna modifica al sorgente

---

## 1. Verifica integrità sorgenti (nessuna modifica)

| File | Dimensione | SHA-256 |
|---|---|---|
| `workspace/input/angular-responsive-golden-master.html` | 16.722 byte | `38C2229E37835F14E7B8210C2A2A8C7B4966133685DD5DF6CD51F222F3D106C6` |
| `workspace/input/timevision-report-v128 1.html` | 225.753 byte | `D077A098727D5AB6F813DDFC67BDFF596E3C688AFE1D9F775429B6439414DFC0` |

✅ Nessun file è stato scritto, copiato o alterato in `workspace/input/`. Entrambi i file sono stati aperti solo in lettura durante questa analisi.

---

## 2. File HTML richiesto per questo run

`workspace/input/` contiene **2 file HTML**. In base ai manufatti già prodotti da **html-scanner-agent** nel contesto di questo run (`workspace/runs/angular-responsive-golden-master/context/app-config.json`, `routing-map.json`, `sections-map.json`), tutti e tre dichiarano esplicitamente:

```json
"sourceFile": "angular-responsive-golden-master.html"
```

➡️ **Il sorgente richiesto per questo run è `angular-responsive-golden-master.html`** (app "ClientFlow — Gestione clienti"). Questo è il file su cui operano Gate 1 (`gate1-menu-analysis`) e tutte le fasi successive del run.

`timevision-report-v128 1.html` è presente in `workspace/input/` ma **non è referenziato da nessun manufatto di questo run** (app-config/routing-map/sections-map puntano tutti a `angular-responsive-golden-master.html`, con `appName: "ClientFlow"`, non "TimeVision"). Viene comunque inventariato di seguito per completezza, ma è classificato **fuori scope per questo run** — appartiene presumibilmente a un run/sessione diverso (esiste infatti un'estrazione SCSS pregressa in `workspace/output/scss/` che lo referenzia esplicitamente come proprio sorgente, vedi §6).

---

## 3. Inventario — `angular-responsive-golden-master.html` (sorgente primario del run)

### 3.1 Struttura documento
- File HTML singolo, autosufficiente: `<style>` inline (1 blocco, righe 7–13) + `<script>` inline (1 blocco, riga 44) + markup (righe 16–42).
- Nessun `<link>` esterno di alcun tipo (nessun CDN, nessun Google Fonts, nessun icon-font). Font dichiarato: `font-family:Inter,Arial,sans-serif` — nessun webfont caricato, fallback su font di sistema.
- Nessun `<img>`, nessuna icona SVG: le icone sono caratteri Unicode/emoji inline (`☰ 🔔 ✎ ⋯ ↻ ‹ › ☎ ✉ ✓ 📅 ◈`).
- Nessuna libreria esterna rilevata (no jQuery, no Bootstrap, no Angular, no Material CDN). JS vanilla puro.

### 3.2 Pagine / link locali correlati
- **Nessun link locale** verso altre pagine HTML (`<a href="...">` puntano tutti a `#`). Non è un prototipo multi-pagina fisico.
- Voci di navigazione sidebar (`.nav a`): `Dashboard` (attiva), `Clienti`, `Contratti`, `Report`, `Impostazioni` — tutte stub non funzionali (nessun routing JS associato, solo classe `.active` statica su "Dashboard"). Coerente con `sections-map.json` che riporta `selector: null` e `estimatedLineCount: 0` per le 4 voci non-dashboard.

### 3.3 CSS
- 1 blocco `<style>` unico in `<head>` (righe 7–13 minificate): design tokens `:root` (10 custom properties: `--bg --surface --text --muted --primary --border --success --warning --danger --radius --shadow`), reset globale, layout shell a grid (`.app`), sidebar, topbar, card/stat, filtri, tabella, paginazione, form a due colonne, activity list, modale (`.modal-backdrop`/`.modal`).
- 4 blocchi `@media` (breakpoint-based, non JS-state-based): `max-width:1180px`, `max-width:900px`, `max-width:680px`, `max-width:440px` — conferma la natura "responsive golden master" del file (contrariamente al pattern del file TimeVision, che usa classi di stato pilotate da JS senza breakpoint CSS).
- Nessun file `.css` esterno, nessun `@import`, nessun `@font-face`.

### 3.4 JavaScript
- 1 blocco `<script>` unico (riga 44), minificato, comportamenti:
  - Toggle sidebar mobile: `#menu` click → `sidebar.classList.add('open')` + `overlay.classList.add('open')`; click su `#overlay` → rimozione classi.
  - Modale "Nuovo cliente" (`#modal`): apertura (`#openModal`), chiusura (`#closeModal`, `#cancelModal`, click su backdrop, tasto `Escape`), focus automatico su `#firstFocus` all'apertura, lock `body.style.overflow` quando aperto.
  - Submit form `#profile`: `preventDefault()` + `alert('Demo: profilo salvato')` (nessuna chiamata rete).
- Nessuno script esterno, nessun bundler/modulo.

### 3.5 Asset immagine/icone
- Nessuno. Icone = caratteri Unicode inline nel markup (non SVG, non icon-font, non file immagine).

### 3.6 Classificazione prototipo
**Dashboard shell single-page con pattern CRUD-style e dialog overlay.**
- **Dashboard shell**: layout a griglia `sidebar + topbar + content`, sidebar collassabile su mobile (breakpoint 900px) via overlay.
- **CRUD-style**: sezione "Gestione clienti" con tabella filtrabile/paginata (elenco clienti), form di dettaglio a due colonne ("Profilo commerciale"), modale di creazione ("+ Nuovo cliente") con validazione visuale dei campi obbligatori (`*`).
- **Non** multi-page (nessuna pagina fisica separata), **non** wizard (nessuno step multiplo), **non** nested-navigation (sidebar piatta a un solo livello, senza sottomenu).
- Elementi navigabili reali: 1 (Dashboard). Le altre 4 voci sidebar sono placeholder non implementati.

---

## 4. Inventario — `timevision-report-v128 1.html` (presente in input, fuori scope per questo run)

> Riportato solo a fini di inventario completo di `workspace/input/`. Non referenziato da `app-config.json` / `routing-map.json` / `sections-map.json` di questo run.

- File HTML singolo (225.753 byte), 1 blocco `<style>` (righe 8–~515, design tokens `:root` con 19 custom properties, prefisso colore `--primary:#EB5E2D`), 1 blocco `<script>` (~103.473 caratteri) con navigazione a viste multiple pilotata da JS (`showReportView('elenco'|'storico')`, id `view-elenco` / `view-storico` con `style="display:none"`), sidebar a più sezioni con sottomenu (`sb-section`/`sb-submenu`: Periodo, Gestione Periodo, Commesse, Ferie e Permessi, Deleghe, Admin, Configurazioni, Impostazioni, Report, Download), wizard modale multi-step (`wizardStates`), modale dettaglio storico, modale conferma eliminazione.
- 1 `<link rel="stylesheet">` esterno: Google Fonts (`Open Sans`) — classificato `EXTERNAL_KEEP`/`VENDOR_KEEP`.
- Classificazione: **nested navigation + wizard** (sidebar multi-livello con sottomenu, area "Report" a due viste con wizard di creazione report multi-step).
- Design token primario `--primary:#EB5E2D` (arancio) — **diverso** dal design token primario del golden master (`--primary:#3b5ccc`, blu), confermando che si tratta di due prototipi/design system distinti e non intercambiabili.

---

## 5. Percorsi vietati / scope

- Nessuna lettura o scrittura effettuata in `.git/**` o `node_modules/**`.
- Unico output prodotto: questo file (`workspace/runs/angular-responsive-golden-master/output/angular/reports/source-discovery.md`).
- Nessun file sotto `workspace/input/**` è stato creato, modificato o cancellato.

---

## 6. Integration contract — output SCSS pregresso (scss-extractor-agent)

Percorso atteso da input di questo step: `workspace/runs/angular-responsive-golden-master/output/scss/**` → **non esiste** (cartella `output/` del run contiene solo la sottocartella vuota fin qui prodotta da questo step).

È stato però trovato un output di estrazione SCSS legacy in `workspace/output/scss/` (fuori dal namespace del run corrente), con:
- `main.scss`, `_variables.scss`, `_base.scss`, `_layout.scss`, `_components.scss`, `_mixins.scss`, `_utilities.scss`, `_breakpoints.scss`, `_bootstrap-compat.scss`, `_overrides.scss`, `_functions.scss`, `_id-patch.scss`, `main.css`, `main.js`
- Report: `reports/inventory.md`, `reports/extraction-report.md` (stato finale: **FAIL** — differenza visiva bloccante non risolta su `#view-storico`, 5/5 viewport falliti), `reports/visual-report.md`, `reports/visual-test-raw.json`
- Screenshot baseline/candidate/diff per 5 viewport (375x812, 768x1024, 1366x768, 1440x900, 1920x1080).

⚠️ **Attenzione — questo output SCSS pregresso è stato generato a partire da `workspace/input/timevision-report-v128 1.html`** (hash verificato in `inventory.md`, design tokens `--primary:#EB5E2D` coerenti con TimeVision), **non** da `angular-responsive-golden-master.html`. Non può quindi essere riusato come integration contract (design tokens / main.scss / struttura) per la generazione della libreria Angular relativa al sorgente di questo run (ClientFlow), perché appartiene a un prototipo diverso con palette e struttura di navigazione differenti.

**Conclusione:** per il sorgente di questo run (`angular-responsive-golden-master.html`) **non esiste ancora** un'estrazione SCSS dedicata. Il team scss-extractor-agent dovrà produrre un output in `workspace/runs/angular-responsive-golden-master/output/scss/` a partire dai 10 design tokens `:root` e dai 4 breakpoint elencati al §3.3 prima che i passi successivi (mapping Material, generazione lib Angular) possano dichiarare un integration contract valido.

---

## 7. Riepilogo numerico

| Elemento (sorgente primario: angular-responsive-golden-master.html) | Conteggio |
|---|---|
| File HTML in `workspace/input/` | 2 |
| File HTML target di questo run | 1 (`angular-responsive-golden-master.html`) |
| Pagine locali correlate (link fisici) | 0 |
| Voci di navigazione (sidebar) | 5 (1 funzionale + 4 stub) |
| Blocchi `<style>` | 1 |
| Blocchi `<script>` | 1 |
| Fogli di stile esterni | 0 |
| Custom properties CSS (`:root`) | 10 |
| Media query responsive | 4 |
| Immagini / SVG / icon-font | 0 (icone = caratteri Unicode inline) |
| Librerie esterne (CDN/vendor) | 0 |
| Modali / overlay | 1 (`#modal` — creazione cliente) |
| Report SCSS pregresso riusabile per questo run | 0 (esiste solo per un sorgente diverso, vedi §6) |
