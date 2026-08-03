# Phase 0 — Source Discovery

**Run:** `angular-responsive-golden-master`
**Step:** `step-00-source-discovery`
**Modalità:** sola lettura — nessuna modifica al sorgente

---

## 1. Verifica integrità sorgenti (nessuna modifica)

| File | Dimensione | SHA-256 |
|---|---|---|
| `workspace/input/angular-responsive-golden-master.html` | 16.722 byte | `38C2229E37835F14E7B8210C2A2A8C7B4966133685DD5DF6CD51F222F3D106C6` |
| `workspace/input/timevision-report-v128 1.html` | 225.753 byte | presente, non hashato in dettaglio (fuori scope, vedi §4) |

✅ Nessun file è stato scritto, copiato o alterato in `workspace/input/`. Il sorgente è stato aperto solo in lettura durante questa analisi.

---

## 2. File HTML richiesto per questo run

`workspace/input/` contiene **2 file HTML**. In base ai manufatti già prodotti nel contesto di questo run (`workspace/runs/angular-responsive-golden-master/context/app-config.json`, `routing-map.json`, `sections-map.json`), tutti dichiarano esplicitamente:

```json
"sourceFile": "angular-responsive-golden-master.html"
"appName": "ClientFlow"
```

➡️ **Il sorgente richiesto per questo run è `angular-responsive-golden-master.html`** (app "ClientFlow — Gestione clienti"). Questo è il file su cui operano Gate 1 (`gate1-menu-analysis.md`, già presente in `output/angular/reports/`) e tutte le fasi successive del run.

`timevision-report-v128 1.html` è presente in `workspace/input/` ma **non è referenziato da nessun manufatto di questo run** — è classificato fuori scope (vedi §4).

---

## 3. Inventario — `angular-responsive-golden-master.html` (sorgente primario del run)

### 3.1 Struttura documento
- File HTML singolo, autosufficiente: `<style>` inline (1 blocco) + `<script>` inline (1 blocco) + markup.
- Nessun `<link>` esterno (nessun CDN, nessun Google Fonts, nessun icon-font). Font: `font-family:Inter,Arial,sans-serif` — nessun webfont caricato, fallback su font di sistema.
- Nessun `<img>`, nessuna icona SVG: le icone sono caratteri Unicode/emoji inline (`☰ 🔔 ✎ ⋯ ↻ ‹ › ☎ ✉ ✓ 📅 ◈`).
- Nessuna libreria esterna rilevata (no jQuery, no Bootstrap, no Angular, no Material CDN). JS vanilla puro, nessun bundler/modulo.

### 3.2 Pagine / link locali correlati
- **Nessun link locale** verso altre pagine HTML (`<a href="...">` puntano tutti a `#`). Non è un prototipo multi-pagina fisico.
- Voci di navigazione sidebar (`.nav a`): `Dashboard` (attiva), `Clienti`, `Contratti`, `Report`, `Impostazioni` — tutte stub non funzionali (nessun routing JS associato, solo classe `.active` statica su "Dashboard"). Coerente con `sections-map.json`, che riporta `selector: null` e `estimatedLineCount: 0` per le 4 voci non-dashboard.

### 3.3 CSS
- 1 blocco `<style>` unico in `<head>`: design tokens `:root` (10 custom properties: `--bg --surface --text --muted --primary --border --success --warning --danger --radius --shadow`), reset globale, layout shell a grid (`.app`), sidebar, topbar, card/stat, filtri, tabella, paginazione, form a due colonne, activity list, modale (`.modal-backdrop`/`.modal`).
- 4 blocchi `@media` (breakpoint-based, non JS-state-based): `max-width:1180px`, `max-width:900px`, `max-width:680px`, `max-width:440px` — conferma la natura "responsive golden master" del file.
- Nessun file `.css` esterno, nessun `@import`, nessun `@font-face`.

### 3.4 JavaScript
- 1 blocco `<script>` unico, comportamenti:
  - Toggle sidebar mobile: `#menu` click → `sidebar.classList.add('open')` + `overlay.classList.add('open')`; click su `#overlay` → rimozione classi.
  - Modale "Nuovo cliente" (`#modal`): apertura (`#openModal`), chiusura (`#closeModal`, `#cancelModal`, click su backdrop, tasto `Escape`), focus automatico su `#firstFocus` all'apertura, lock `body.style.overflow` quando aperto.
  - Submit form `#profile`: `preventDefault()` + `alert('Demo: profilo salvato')` (nessuna chiamata rete).
- Nessuno script esterno.

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

- File HTML singolo (225.753 byte), design tokens `:root` con prefisso colore `--primary:#EB5E2D` (arancio), navigazione a viste multiple pilotata da JS, sidebar a più sezioni con sottomenu, wizard modale multi-step, modale dettaglio storico.
- Classificazione: nested navigation + wizard — prototipo distinto da ClientFlow, non intercambiabile (design token e struttura di navigazione diversi).

---

## 5. Percorsi vietati / scope

- Nessuna lettura o scrittura effettuata in `.git/**` o `node_modules/**`.
- Unico output prodotto: questo file (`workspace/runs/angular-responsive-golden-master/output/angular/reports/source-discovery.md`).
- Nessun file sotto `workspace/input/**` è stato creato, modificato o cancellato.

---

## 6. Integration contract — output SCSS pregresso

Percorso atteso da input di questo step: `workspace/runs/angular-responsive-golden-master/output/scss/**` → **non esiste** (nessuna estrazione SCSS è mai stata prodotta all'interno del namespace di questo run).

È stato verificato (sola lettura, fuori dai path autorizzati di scrittura di questo step) un output SCSS in `workspace/output/scss/` (namespace globale, **non** del run corrente):
- Contiene un unico file: `main.scss` (46.958 byte). Non esistono, allo stato attuale, i file satellite (`_variables.scss`, `_base.scss`, ecc.) né cartelle `reports/`/screenshot precedentemente attesi: l'unico artefatto realmente presente è `main.scss`.
- Ispezionando l'intestazione di `main.scss` (righe 1-27): design tokens `--primary:#EB5E2D`, commento esplicito `TIMEVISION DESIGN TOKENS`, selettori `#sidebar`, `.sb-header`, `.sb-nav` — **struttura e palette coerenti con `timevision-report-v128 1.html`**, non con `angular-responsive-golden-master.html` (che usa `--primary:#3b5ccc`, blu, e selettori basati su classi `.sidebar`/`.nav`/`.topbar`).

⚠️ **Conclusione:** questo output SCSS pregresso appartiene al prototipo TimeVision, non a ClientFlow/golden-master. **Non può essere riusato come integration contract** (design tokens, main.scss, struttura) per la generazione della libreria Angular relativa al sorgente di questo run.

Per il sorgente di questo run (`angular-responsive-golden-master.html`) **non esiste ancora** un'estrazione SCSS dedicata sotto `workspace/runs/angular-responsive-golden-master/output/scss/`. I passi successivi (mapping Material, generazione lib Angular) dovranno produrre/derivare i design token direttamente dai 10 custom properties `:root` e dai 4 breakpoint elencati al §3.3, poiché non è disponibile un integration contract SCSS riusabile per questo run.

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
| Report SCSS pregresso riusabile per questo run | 0 (esiste solo per un sorgente diverso — TimeVision, vedi §6) |
