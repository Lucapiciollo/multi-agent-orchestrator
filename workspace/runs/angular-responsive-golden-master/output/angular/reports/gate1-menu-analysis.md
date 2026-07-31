# Phase 1 — Menu / Navigation Analysis (Gate 1)

**Run:** `angular-responsive-golden-master`
**Step:** `step-01-navigation-analysis`
**Sorgente analizzato:** `workspace/input/angular-responsive-golden-master.html` (app "ClientFlow — Gestione clienti")
**Modalità:** sola analisi — nessuna implementazione, nessuna selezione automatica della sezione

---

## 1. Metodologia

Sono stati ispezionati, sul markup e sullo script inline del sorgente:
- `<nav class="nav">` in `<aside class="sidebar">` (righe 18) — 5 elementi `<a href="#">`
- Bottone hamburger `#menu` (topbar, riga 21) — meccanismo di navigazione responsive (toggle sidebar)
- Overlay `#overlay` (riga 19) — companion del toggle sidebar mobile
- Trigger di apertura modale `#openModal` (riga 23) — bottone con `onclick`/listener JS che apre un flusso overlay
- Bottoni di paginazione `.page` (riga 38) — verificati e classificati come **non-navigazione tra sezioni** (paginazione dati interna alla tabella, stesso context, nessun routing)
- Nessun tab-like element, nessun dropdown, nessun data-attribute di routing (`data-route`, `data-target`, `data-view`, ecc.), nessun secondo `<nav>`, nessun breadcrumb.
- Nessuna richiesta a pagine locali fisiche (`.html`) — tutti gli `href` sono `#`.

Duplicati: nessuno rilevato (5 voci sidebar con label univoche, 1 solo trigger modale).

---

## 2. Elenco numerato sezioni candidate (Gate 1)

```
[1] Dashboard ★
[2] Clienti
[3] Contratti
[4] Report
[5] Impostazioni
[6] Nuovo cliente (dialog) ★
```

---

## 3. Dettaglio per voce

### [1] Dashboard ★ (funzionalmente implementata)
- **source**: `<a class="active" href="#">Dashboard</a>` — riga 18, `<nav class="nav">` in `<aside class="sidebar" id="sidebar">`
- **target**: nessun href reale (`#`); il contenuto associato è l'intero `<section class="content">` (righe 22–40): heading "Gestione clienti", stats, tabella clienti, form profilo commerciale, activity list
- **type**: `page-section` (sidebar nav item, unica voce con contenuto renderizzato)
- **selector**: `.sidebar .nav a.active` / `.sidebar .nav a:nth-child(1)`
- **parent**: `.sidebar .nav` (menu piatto, nessun livello superiore)
- **submenu**: nessuno
- **icon**: nessuna icona dedicata alla voce (solo il brand `◈ ClientFlow` in cima alla sidebar, riga 18); icone Unicode presenti nel contenuto associato (🔔 ✎ ⋯ ↻ ☎ ✉ ✓ 📅)
- **source file**: `angular-responsive-golden-master.html`
- **meccanismo di navigazione**: nessun routing JS — è l'unica voce con markup di contenuto reale nella stessa pagina; stato attivo impostato staticamente via classe CSS `active` nel markup, non da JS
- **pagina correlata**: nessuna pagina fisica — contenuto inline nello stesso documento
- **selettore stato attivo**: `.nav a.active` (classe statica hardcoded nel sorgente, non toggling JS)
- **comportamento responsive**: la sidebar (quindi anche il menu) collassa sotto i 900px (`@media(max-width:900px)`), diventando `position:fixed` fuori schermo (`transform:translateX(-102%)`); si apre con la classe `.open` tramite il bottone hamburger `#menu` (`sidebar.classList.add('open')`) e overlay associato (`#overlay`); chiusura via click su overlay o tasto `Escape`. Sotto i 440px `.user-info` viene nascosto e i bottoni azione diventano full-width.

### [2] Clienti
- **source**: `<a href="#">Clienti</a>` — riga 18, 2° elemento di `.sidebar .nav`
- **target**: nessuno (`href="#"`, nessun contenuto/route associato nel sorgente)
- **type**: `stub-page-section`
- **selector**: `.sidebar .nav a:nth-child(2)`
- **parent**: `.sidebar .nav`
- **submenu**: nessuno
- **icon**: nessuna
- **source file**: `angular-responsive-golden-master.html`
- **meccanismo di navigazione**: nessuno — nessun listener JS associato, nessun `data-*` di routing, nessuna classe di stato dinamica
- **pagina correlata**: nessuna (stub)
- **selettore stato attivo**: nessuno (mai marcata `.active`)
- **comportamento responsive**: eredita il comportamento di collasso/apertura della sidebar descritto in [1], nessun comportamento proprio aggiuntivo

### [3] Contratti
- **source**: `<a href="#">Contratti</a>` — riga 18, 3° elemento di `.sidebar .nav`
- **target**: nessuno
- **type**: `stub-page-section`
- **selector**: `.sidebar .nav a:nth-child(3)`
- **parent**: `.sidebar .nav`
- **submenu**: nessuno
- **icon**: nessuna
- **source file**: `angular-responsive-golden-master.html`
- **meccanismo di navigazione**: nessuno (stub)
- **pagina correlata**: nessuna
- **selettore stato attivo**: nessuno
- **comportamento responsive**: eredita comportamento sidebar di [1]

### [4] Report
- **source**: `<a href="#">Report</a>` — riga 18, 4° elemento di `.sidebar .nav`
- **target**: nessuno
- **type**: `stub-page-section`
- **selector**: `.sidebar .nav a:nth-child(4)`
- **parent**: `.sidebar .nav`
- **submenu**: nessuno
- **icon**: nessuna
- **source file**: `angular-responsive-golden-master.html`
- **meccanismo di navigazione**: nessuno (stub)
- **pagina correlata**: nessuna
- **selettore stato attivo**: nessuno
- **comportamento responsive**: eredita comportamento sidebar di [1]

### [5] Impostazioni
- **source**: `<a href="#">Impostazioni</a>` — riga 18, 5° elemento di `.sidebar .nav`
- **target**: nessuno
- **type**: `stub-page-section`
- **selector**: `.sidebar .nav a:nth-child(5)`
- **parent**: `.sidebar .nav`
- **submenu**: nessuno
- **icon**: nessuna
- **source file**: `angular-responsive-golden-master.html`
- **meccanismo di navigazione**: nessuno (stub)
- **pagina correlata**: nessuna
- **selettore stato attivo**: nessuno
- **comportamento responsive**: eredita comportamento sidebar di [1]

### [6] Nuovo cliente (dialog) ★ (funzionalmente implementata)
- **source**: `<button class="btn" id="openModal">+ Nuovo cliente</button>` — riga 23, dentro `.heading .actions` (contenuto della sezione Dashboard/Gestione clienti)
- **target**: `<div class="modal-backdrop" id="modal">` — riga 42, overlay/dialog "Nuovo cliente" con form (Nome*, Cognome*, Azienda, Email*, Segmento, Stato iniziale, Note iniziali)
- **type**: `modal-trigger` (non è una "pagina" di navigazione primaria, ma un flusso di navigazione secondario via overlay — incluso qui per completezza come richiesto dal task, sarà comunque ri-analizzato in dettaglio nella fase dedicata a dialog/modali)
- **selector**: `#openModal` → apre `#modal.modal-backdrop`
- **parent**: `.heading .actions` (non è parte del menu sidebar, è un'azione della sezione Dashboard)
- **submenu**: n/a
- **icon**: nessuna icona dedicata (solo testo "+ Nuovo cliente")
- **source file**: `angular-responsive-golden-master.html`
- **meccanismo di navigazione**: JS vanilla — `document.getElementById('openModal').onclick=()=>setModal(true)`; chiusura via `#closeModal`, `#cancelModal`, click sul backdrop, tasto `Escape`; focus automatico su `#firstFocus` all'apertura; `body.style.overflow` lockato quando aperto
- **pagina correlata**: nessuna pagina fisica — overlay in-page
- **selettore stato attivo**: `.modal-backdrop.open` (classe toggled via `modal.classList.toggle('open', v)`)
- **comportamento responsive**: `.modal-backdrop` ha `padding:20px` di default, ridotto a `10px` sotto i 440px; `.modal` ha `max-height:calc(100dvh - 40px)` di default, `calc(100dvh - 20px)` sotto i 440px; footer del modal passa a layout `grid` a colonna singola con bottoni full-width sotto i 440px

---

## 4. Elementi verificati e scartati come "non-navigazione"

| Elemento | Selector | Motivo esclusione |
|---|---|---|
| Bottoni paginazione | `.pagination .page` | Paginazione dati interna alla tabella "Elenco clienti", nessun cambio di sezione/route, nessun listener JS presente nel sorgente (markup statico) |
| Bottone refresh tabella | `.card-header .icon-btn` (↻) | Nessun listener JS associato nel sorgente, azione presunta di refresh dati, non navigazione |
| Bottoni riga tabella (✎ / ⋯) | `.row-actions .icon-btn` | Nessun listener JS associato, azioni CRUD presunte su riga, non navigazione a sezione |
| Bottone hamburger `#menu` | `#menu` | Meccanismo di navigazione **responsive** (toggle sidebar), non target di una sezione autonoma — documentato come comportamento di [1] Dashboard |
| Bottone "Esporta CSV" | `.actions .btn.secondary` | Nessun listener JS, nessuna sezione/dialog target nel sorgente |
| Bottone "+" attività recenti | `aside .card-header .icon-btn` | Nessun listener JS, nessun target associato |
| Submit form profilo (`#profile`) | `#profile` | `preventDefault()` + `alert()` — non è navigazione tra sezioni, resta nella stessa vista Dashboard |

---

## 5. Normalizzazione duplicati

Nessun duplicato rilevato tra le 6 voci elencate: label, selector e meccanismo di navigazione sono ciascuno univoci nel sorgente.

---

## 6. Esito Gate 1

✅ Elenco completo delle sezioni candidate prodotto (6 voci: 5 sidebar + 1 dialog trigger), con evidenza ★ sulle 2 funzionalmente implementate (**[1] Dashboard**, **[6] Nuovo cliente**).

⚠️ **Nessuna sezione è stata selezionata automaticamente.** Questo step si ferma qui in attesa della **selezione esplicita dell'utente** tramite l'interfaccia, che indicherà quale voce tra `[1]`–`[6]` proseguire nella Phase 2 (scoperta flusso sezione). Non è stata dichiarata alcuna "SELECTED SECTION".
