# Gate 1 — Menu / Navigation Analysis

**Run:** `angular-responsive-golden-master`
**Step:** `step-01-navigation-analysis`
**Sorgente analizzato:** `workspace/input/angular-responsive-golden-master.html` (app "ClientFlow — Gestione clienti", confermato da `source-discovery.md` §2 come unico file HTML in scope per questo run)
**Modalità:** sola analisi — nessuna implementazione, nessuna selezione automatica della sezione

---

## 1. Metodologia

Sono stati ispezionati, sul markup e sullo script inline del sorgente, nell'ordine richiesto dalla Phase 1:
- `<nav>` sidebar (`<aside class="sidebar" id="sidebar"><nav class="nav">`) — 5 elementi `<a href="#">`
- sidebar collassabile / hamburger menu (`.menu-btn`, `#menu`) e overlay di chiusura (`#overlay`)
- bottoni con handler `onclick`/listener JS che aprono/chiudono flussi overlay (`#openModal`, `#closeModal`, `#cancelModal`, click backdrop, tasto `Escape`)
- tab che fungono da navigazione interna → **nessuna trovata** (nessun elemento `.tab`/`role="tab"`)
- item menu guidati da JS / data-attribute di routing → **nessuno trovato** (nessun `data-route`, `data-target`, `data-view`)
- link a pagine locali fisiche → **nessuno trovato** (tutti gli `<a href>` puntano a `#`)
- comportamento responsive di ciascun meccanismo (breakpoint associato)

I duplicati sono stati normalizzati: i tre trigger di chiusura modale (`#closeModal`, `#cancelModal`, click-backdrop) più il tasto `Escape` convergono sulla stessa funzione JS `setModal(false)` e sono raggruppati in un'unica voce [9].

---

## 2. Elenco numerato delle sezioni/voci di navigazione candidate

```
[1] Dashboard ★
[2] Clienti
[3] Contratti
[4] Report
[5] Impostazioni
[6] Hamburger menu (sidebar toggle mobile) ★
[7] Overlay chiusura sidebar mobile ★
[8] Trigger modale "Nuovo cliente" ★
[9] Chiusura modale "Nuovo cliente" ★
```

---

## 3. Dettaglio per voce

### [1] Dashboard ★
- **source**: `<a class="active" href="#">Dashboard</a>` — dentro `<aside class="sidebar" id="sidebar"><nav class="nav">`
- **target/href**: `#` (nessun target reale — SPA a singola vista)
- **type**: `page-section` (sidebar nav item)
- **selector**: `.sidebar .nav a.active` / `.sidebar .nav a:nth-child(1)`
- **parent**: `.sidebar .nav` (menu piatto, 1 solo livello)
- **submenu**: nessuno
- **icon**: nessuna icona dedicata alla voce (il brand `◈ ClientFlow` in cima alla sidebar è il logo dell'app, non un'icona di questa voce)
- **source file**: `angular-responsive-golden-master.html`
- **meccanismo di navigazione**: link statico `<a>`, nessun handler JS di routing; classe `.active` hardcoded nel markup, non pilotata da JS
- **pagina/contenuto correlato**: l'intera `<section class="content">` renderizzata nel documento — heading "Gestione clienti", 4 stat card, tabella clienti con filtri/paginazione, form "Profilo commerciale", lista "Attività recenti"
- **selettore stato attivo**: `.nav a.active` (statico, non toggled da JS)
- **comportamento responsive**: la sidebar collassa sotto i 900px (`position:fixed`, `transform:translateX(-102%)`), apribile solo tramite [6]/[7]; sopra i 900px sempre visibile (`position:sticky`)
- **nota**: ★ unica voce con contenuto realmente implementato e renderizzato (non stub)

### [2] Clienti
- **source**: `<a href="#">Clienti</a>` — 2° elemento di `.sidebar .nav`
- **target/href**: `#`
- **type**: `stub-page-section`
- **selector**: `.sidebar .nav a:nth-child(2)`
- **parent**: `.sidebar .nav`
- **submenu**: nessuno
- **icon**: nessuna
- **source file**: `angular-responsive-golden-master.html`
- **meccanismo di navigazione**: nessuno — link statico senza handler JS, nessun contenuto associato
- **pagina correlata**: nessuna (stub)
- **selettore stato attivo**: nessuno (mai marcata `.active`)
- **comportamento responsive**: eredita il collasso/apertura della sidebar descritto in [1]

### [3] Contratti
- **source**: `<a href="#">Contratti</a>` — 3° elemento di `.sidebar .nav`
- **target/href**: `#`
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
- **source**: `<a href="#">Report</a>` — 4° elemento di `.sidebar .nav`
- **target/href**: `#`
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
- **nota**: ⚠️ non confondere con l'area "Report" del prototipo `timevision-report-v128 1.html` — quel file è fuori scope per questo run (vedi `source-discovery.md` §4)

### [5] Impostazioni
- **source**: `<a href="#">Impostazioni</a>` — 5° elemento di `.sidebar .nav`
- **target/href**: `#`
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

### [6] Hamburger menu (sidebar toggle mobile) ★
- **source**: `<button class="icon-btn menu-btn" id="menu">☰</button>` + JS `document.getElementById('menu').onclick=()=>{sidebar.classList.add('open');overlay.classList.add('open')}`
- **target**: rende visibile la sidebar [1]-[5]
- **type**: `nav-toggle` (meccanismo responsive, non voce di menu autonoma)
- **selector**: `#menu` (`.icon-btn.menu-btn`)
- **parent**: `.topbar .top-left`
- **submenu**: n/a
- **icon**: carattere Unicode `☰` inline (nessun SVG/icon-font)
- **source file**: `angular-responsive-golden-master.html` (script inline)
- **meccanismo di navigazione**: JS onclick — aggiunge `.open` a `#sidebar` e `#overlay`
- **pagina correlata**: nessuna pagina propria — apre la sidebar di navigazione
- **selettore stato attivo**: `.sidebar.open`, `.overlay.open`
- **comportamento responsive**: visibile solo sotto i 900px (`display:none` di default → `display:block` in `@media(max-width:900px)`); su desktop nascosto, sidebar sempre visibile
- **nota**: ★ meccanismo funzionale verificato nello script inline

### [7] Overlay chiusura sidebar mobile ★
- **source**: `<div class="overlay" id="overlay"></div>` + JS `overlay.onclick=()=>{sidebar.classList.remove('open');overlay.classList.remove('open')}`
- **target**: chiude la sidebar [1]-[5]
- **type**: `nav-toggle` (companion di chiusura di [6])
- **selector**: `#overlay`
- **parent**: `.app` (sibling diretto di `.sidebar` e `.main`)
- **submenu**: n/a
- **icon**: nessuna (area di sfondo scurita, cliccabile)
- **source file**: `angular-responsive-golden-master.html`
- **meccanismo di navigazione**: JS onclick — rimuove `.open` da `#sidebar`/`#overlay`; chiusura anche via tasto globale `Escape`
- **pagina correlata**: nessuna
- **selettore stato attivo**: `.overlay.open` (`display:block` solo se aperto)
- **comportamento responsive**: attivo solo sotto i 900px, stesso breakpoint di [6]
- **nota**: ★ meccanismo funzionale — controparte di chiusura di [6]

### [8] Trigger modale "Nuovo cliente" ★
- **source**: `<button class="btn" id="openModal">+ Nuovo cliente</button>` — dentro `.heading .actions`
- **target**: `<div class="modal-backdrop" id="modal">` — dialog "Nuovo cliente" con form (Nome*, Cognome*, Azienda, Email*, Segmento, Stato iniziale, Note iniziali)
- **type**: `modal-trigger`
- **selector**: `#openModal` → apre `#modal.modal-backdrop`
- **parent**: `.heading .actions` (azione della sezione Dashboard, non del menu sidebar)
- **submenu**: n/a
- **icon**: nessuna icona dedicata (solo simbolo testuale `+` nel testo del bottone)
- **source file**: `angular-responsive-golden-master.html`
- **meccanismo di navigazione**: JS onclick → `setModal(true)` → aggiunge `.open` a `#modal`, focus automatico su `#firstFocus` dopo 50ms, `body.style.overflow='hidden'` mentre aperto
- **pagina correlata**: modale "Nuovo cliente" (overlay in-page, non pagina fisica)
- **selettore stato attivo**: `.modal-backdrop.open` (`display:flex` quando aperto)
- **comportamento responsive**: dialog `width:min(620px,100%)`; padding backdrop ridotto a 10px sotto i 440px; footer bottoni impilati full-width sotto i 440px
- **nota**: ★ meccanismo funzionale verificato nello script inline

### [9] Chiusura modale "Nuovo cliente" ★
- **source**: `<button class="icon-btn" id="closeModal">×</button>` (header) + `<button class="btn secondary" id="cancelModal">Annulla</button>` (footer) + click su `#modal` (area backdrop) + tasto globale `Escape`
- **target**: chiude `#modal` aperto da [8]
- **type**: `modal-close` (4 trigger equivalenti normalizzati in 1 voce)
- **selector**: `#closeModal`, `#cancelModal`, `#modal` (click con `e.target===modal`), listener globale `keydown`
- **parent**: `#modal .modal-header` (per `#closeModal`), `#modal .modal-footer` (per `#cancelModal`)
- **submenu**: n/a
- **icon**: carattere Unicode `×` inline su `#closeModal`
- **source file**: `angular-responsive-golden-master.html`
- **meccanismo di navigazione**: tutti e 4 i trigger convergono su `setModal(false)`; `Escape` chiude contestualmente anche la sidebar mobile se aperta
- **pagina correlata**: nessuna — chiude [8] senza navigare
- **selettore stato attivo**: rimozione di `.modal-backdrop.open`
- **comportamento responsive**: nessuna variazione oltre quanto già descritto in [8]
- **nota**: ★ meccanismo funzionale — raggruppa 4 varianti equivalenti dello stesso comportamento di chiusura (evita duplicazione di voci)

---

## 4. Elementi verificati e scartati come "non-navigazione"

| Elemento | Selector | Motivo esclusione |
|---|---|---|
| Bottoni paginazione tabella clienti | `.pagination .page` (`‹ 1 2 3 4 … 321 ›`) | Paginazione dati interna alla stessa tabella, nessun listener JS presente nel sorgente (markup statico), nessun cambio sezione |
| Filtri elenco clienti (Ricerca/Stato/Segmento/Account manager, Reset/Filtra) | `.filters`, `.filter-actions` | Filtro dati in-page, nessun listener JS presente, nessuna navigazione |
| Bottone refresh tabella `↻` | `.card-header .icon-btn` | Nessun listener JS associato, azione presunta di refresh dati, non navigazione |
| Bottone notifiche `🔔` | `.topbar .icon-btn` | Nessun listener JS, nessun target/vista associata |
| Bottoni riga tabella (`✎`, `⋯`) | `.row-actions .icon-btn` | Nessun listener JS, azioni CRUD presunte su riga, non navigazione a sezione |
| Submit form "Profilo commerciale" | `#profile` (`onsubmit`) | `preventDefault()` + `alert('Demo: profilo salvato')` — azione di salvataggio, non navigazione tra sezioni |
| Bottoni "Esporta CSV" / "Annulla" / "Salva modifiche" | `.actions .btn.secondary`, `.form-footer .btn` | Azioni CRUD in-page, nessun listener JS di routing |
| Bottone "+" attività recenti | `aside .card-header .icon-btn` | Nessun listener JS, nessun target associato |

Meccanismi di navigazione espressamente cercati e **non trovati**: tab-navigazione, dropdown menu, sottomenu sidebar (nav piatta a 1 livello), data-attribute di routing (`data-route`/`data-view`/`data-target`), link a pagine `.html` locali, router/history API.

---

## 5. Normalizzazione duplicati applicata

- `#closeModal` + `#cancelModal` + click-backdrop (`modal.onclick` con `e.target===modal`) + tasto `Escape` → normalizzati in un'unica voce **[9]** (stessa funzione JS `setModal(false)`, stesso target)
- `#menu` (apertura, [6]) e `#overlay` (chiusura, [7]) mantenuti come voci **distinte** poiché rappresentano azioni opposte con proprio selettore/trigger DOM dedicato, non duplicati tra loro

---

## 6. Riepilogo

| # | Voce | Type | Funzionale (★) | Target/contenuto correlato |
|---|---|---|---|---|
| 1 | Dashboard | page-section | ★ sì | Vista "Gestione clienti" (unico contenuto renderizzato) |
| 2 | Clienti | stub-page-section | no | nessuno |
| 3 | Contratti | stub-page-section | no | nessuno |
| 4 | Report | stub-page-section | no | nessuno |
| 5 | Impostazioni | stub-page-section | no | nessuno |
| 6 | Hamburger menu | nav-toggle | ★ sì | apre sidebar [1]-[5] |
| 7 | Overlay chiusura sidebar | nav-toggle | ★ sì | chiude sidebar [1]-[5] |
| 8 | Trigger modale "Nuovo cliente" | modal-trigger | ★ sì | Modale "Nuovo cliente" |
| 9 | Chiusura modale "Nuovo cliente" | modal-close | ★ sì | chiude modale [8] |

**Totale voci candidate**: 9 (5 nav-link sidebar + 2 meccanismi toggle sidebar mobile + 2 meccanismi modale)
**Voci funzionalmente implementate (★)**: 5 → [1], [6], [7], [8], [9]
**Voci stub (non implementate)**: 4 → [2], [3], [4], [5]

---

## 7. Esito Gate 1

✅ Elenco completo delle sezioni/voci di navigazione candidate prodotto (9 voci), con evidenza ★ sulle 5 funzionalmente implementate.

⚠️ **Nessuna sezione è stata selezionata autonomamente.** Questo step si ferma qui in attesa della **selezione esplicita dell'utente** tramite l'interfaccia, che indicherà quale voce tra `[1]`–`[9]` proseguire nella Phase 2 (scoperta flusso sezione). Non viene dichiarata alcuna "SELECTED SECTION".
