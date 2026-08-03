# Phase 2 — Section Flow Discovery

**Run:** `angular-responsive-golden-master`
**Step:** `step-02-section-flow-discovery`
**Sezione in scope (vincolante):** `Dashboard` — voce **[1]** di `gate1-menu-analysis.md`, come dichiarato in `selected-section.md` ("Selezionata manualmente dall'interfaccia il 2026-07-31T14:27:28.820Z... vincolante per tutti i task successivi"). Nessuna ridiscussione della scelta effettuata in questo step.
**Sorgente analizzato:** `workspace/input/angular-responsive-golden-master.html`
**Modalità:** sola analisi — nessuna generazione di codice Angular

---

## 1. Perimetro della sezione "Dashboard"

Come già osservato in `gate1-menu-analysis.md` (§3, voce [1]) e in `source-discovery.md` (§3.6), la sidebar è piatta a 1 livello e **solo la voce "Dashboard" ha contenuto realmente renderizzato**. Le altre 4 voci sidebar (Clienti, Contratti, Report, Impostazioni) sono stub senza markup/JS associato e restano fuori scope per questo step — non generano stati, sotto-viste o transizioni da documentare.

Il contenuto della sezione Dashboard coincide con l'intera `<section class="content">` (righe 22–41 del sorgente), intitolata **"Gestione clienti"**, e include:
1. Header azioni pagina (Esporta CSV / + Nuovo cliente)
2. Blocco statistiche (4 stat card, sola lettura)
3. Card "Elenco clienti" (tabella con filtri, paginazione, refresh, row-actions)
4. Card "Profilo commerciale" (form dettaglio cliente selezionato)
5. Card "Attività recenti" (lista sola lettura + bottone "+")
6. Modale "Nuovo cliente" (overlay CRUD, aperto/chiuso da azioni della Dashboard)

A questi si aggiungono i 2 meccanismi di navigazione trasversali già mappati come ★ in Gate 1 (hamburger menu sidebar mobile [6] e overlay di chiusura [7]), che non sono stati/sotto-viste della Dashboard ma **wrappano** il layout in cui essa vive e vanno quindi documentati come stati del "guscio" applicativo entro cui la sezione è renderizzata.

---

## 2. Elenco pagine/stati/sotto-viste con selettore e file sorgente

Tutti gli elementi elencati appartengono all'unico file sorgente `angular-responsive-golden-master.html` (non ci sono pagine fisiche separate: SPA a singola vista, coerente con `source-discovery.md` §3.2).

| # | Pagina/Stato/Sotto-vista | Selettore | Tipo | Stato iniziale |
|---|---|---|---|---|
| S0 | Shell applicativa (sidebar + topbar + content) | `.app` | layout-shell | sempre montato |
| S1 | Sidebar navigazione (desktop: sempre visibile; mobile: collassata) | `.sidebar#sidebar` | nav-shell | desktop: visibile · mobile (<900px): `translateX(-102%)` (chiusa) |
| S2 | Overlay di sfondo sidebar mobile | `.overlay#overlay` | overlay-toggle | chiuso (`display:none`) |
| S3 | Topbar (ricerca, notifiche, avatar utente) | `.topbar` | header statico | sempre visibile, nessuno stato |
| S4 | Dashboard — vista "Gestione clienti" (contenuto principale) | `.content` | page-view | vista unica sempre attiva (nessun routing multi-vista) |
| S4.1 | Heading + azioni pagina | `.heading .actions` | sub-block | statico |
| S4.2 | Blocco statistiche (4 stat card) | `.stats .card.stat` (×4) | sub-view / dati sola lettura | statico, nessuna transizione |
| S4.3 | Card "Elenco clienti" | `section.card` (contenente `.filters` + `table`) | sub-view CRUD | tabella con 4 righe visibili su 1284 totali |
| S4.3.a | Filtri elenco clienti | `.filters` (Ricerca, Stato, Segmento, Account manager) | filtro dati (in-page) | tutti i select su "Tutti", ricerca vuota |
| S4.3.b | Tabella clienti + row-actions | `.table-wrap table` | tabella dati + azioni riga | 4 righe mock renderizzate |
| S4.3.c | Paginazione elenco clienti | `.table-footer .pagination` | paginazione | pagina attiva `.page.active` = "1" (di 321 pagine) |
| S4.4 | Card "Profilo commerciale" (form dettaglio cliente) | `.bottom article.card form#profile` | form-view | precompilato con dati del 1° cliente (Andrea Romano) |
| S4.5 | Card "Attività recenti" | `.bottom aside.card .activity-list` | lista sola lettura | 4 attività statiche |
| M1 | Modale "Nuovo cliente" (CHIUSO) | `.modal-backdrop#modal` (senza `.open`) | modal-state | stato di default — `display:none` |
| M1-open | Modale "Nuovo cliente" (APERTO) | `.modal-backdrop#modal.open` | modal-state | attivato da S4.1 → `#openModal` |

---

## 3. Grafo del flusso di interazione (descrizione testuale)

```
[Caricamento pagina]
        │
        ▼
  S0 Shell applicativa monta
        │
        ├── S1 Sidebar (desktop: aperta permanente / mobile: chiusa)
        ├── S2 Overlay (chiuso)
        ├── S3 Topbar (statica)
        └── S4 Dashboard "Gestione clienti" (vista unica, sempre attiva)
                │
                ├── S4.1 Heading + azioni
                │        ├─(click "Esporta CSV")──▶ azione client-side, NESSUN listener JS nel sorgente
                │        │                           (bottone presente ma privo di handler — vedi §4)
                │        └─(click "+ Nuovo cliente", id=openModal)──▶ M1-open [transizione T1]
                │
                ├── S4.2 Stat card (sola lettura, nessuna transizione in uscita)
                │
                ├── S4.3 Card "Elenco clienti"
                │        ├─(click "↻" refresh, .card-header .icon-btn)──▶ nessun listener JS (bottone statico)
                │        ├── S4.3.a Filtri
                │        │        ├─(input Ricerca / select Stato/Segmento/Account manager)──▶ nessun listener JS
                │        │        ├─(click "Reset")──▶ nessun listener JS
                │        │        └─(click "Filtra")──▶ nessun listener JS
                │        │        (filtri renderizzati ma non funzionali nel sorgente: nessuna riga di script li referenzia)
                │        ├── S4.3.b Tabella clienti
                │        │        └─(click "✎" / "⋯" su riga)──▶ nessun listener JS (row-actions presunte CRUD, non implementate)
                │        └── S4.3.c Paginazione
                │                 └─(click "‹ 1 2 3 4 … 321 ›")──▶ nessun listener JS (markup statico, pagina "1" hardcoded `.active`)
                │
                ├── S4.4 Form "Profilo commerciale" (#profile)
                │        ├─(submit form, bottone "Salva modifiche")──▶ T2: preventDefault() + alert('Demo: profilo salvato')
                │        │                                              (nessuna chiamata di rete, nessuna navigazione, nessun cambio di stato persistente)
                │        └─(click "Annulla", type=button)──▶ nessun listener JS (nessun reset esplicito)
                │
                └── S4.5 Attività recenti
                         └─(click "+", aside .card-header .icon-btn)──▶ nessun listener JS

[Meccanismi trasversali — non stati della Dashboard ma del guscio applicativo]

  S1 Sidebar (mobile, <900px, stato chiuso)
        │
        ├─(click "☰" hamburger, id=menu) ── T3 ──▶ S1.open (.sidebar.open) + S2.open (.overlay.open)
        │
  S1.open + S2.open (sidebar mobile aperta, overlay visibile)
        │
        ├─(click su overlay, id=overlay) ── T4 ──▶ torna a S1 chiuso + S2 chiuso
        └─(tasto Escape) ── T4b ──▶ torna a S1 chiuso + S2 chiuso (stessa funzione)

[Flusso modale "Nuovo cliente" — dettaglio]

  M1 (chiuso, default)
        │
        │  T1: click "+ Nuovo cliente" (#openModal)
        │      → setModal(true)
        │      → modal.classList.add('open')
        │      → document.body.style.overflow = 'hidden'  (lock scroll pagina sottostante)
        │      → dopo 50ms: focus automatico su #firstFocus (campo "Nome *")
        ▼
  M1-open (.modal-backdrop.open, display:flex)
        │  form interno (non-<form> HTML, solo div con campi):
        │    - Nome * (input, focus iniziale)
        │    - Cognome * (input)
        │    - Azienda (input)
        │    - Email * (input type=email)
        │    - Segmento (select: Enterprise/PMI/Startup)
        │    - Stato iniziale (select: Attivo / In attesa[default] / Sospeso)
        │    - Note iniziali (textarea)
        │
        ├─(click "×", id=closeModal) ─────────┐
        ├─(click "Annulla", id=cancelModal) ──┤
        ├─(click su area backdrop, e.target===modal) ─┤── T5: setModal(false), normalizzati in un'unica transizione
        ├─(tasto Escape, keydown globale) ────┤        (chiude anche sidebar mobile se aperta — T4b)
        │                                     ▼
        │                              M1 (chiuso) — torna a stato iniziale
        │
        └─(click "Crea cliente", bottone finale footer) ──▶ nessun listener JS nel sorgente
                                                              (bottone presente ma privo di handler — azione CRUD
                                                              "create" NON implementata, da prevedere lato Angular
                                                              come dispatch NgRx verso il service/mock)
```

---

## 4. Elenco transizioni (riepilogo tabellare)

| ID | Trigger | Selettore trigger | Da stato | A stato | Meccanismo sorgente | Implementata nel sorgente? |
|---|---|---|---|---|---|---|
| T1 | click "+ Nuovo cliente" | `#openModal` | M1 (chiuso) | M1-open | `setModal(true)` + focus `#firstFocus` dopo 50ms + `body.style.overflow='hidden'` | ✅ sì |
| T2 | submit form Profilo commerciale | `#profile` (onsubmit) | S4.4 | S4.4 (nessun cambio visivo persistente) | `preventDefault()` + `alert('Demo: profilo salvato')` | ✅ sì (solo alert demo, no persistenza) |
| T3 | click hamburger menu | `#menu` | S1 chiuso + S2 chiuso | S1.open + S2.open | `sidebar.classList.add('open')` + `overlay.classList.add('open')` | ✅ sì (solo mobile <900px, `.menu-btn{display:none}` su desktop) |
| T4 | click su overlay | `#overlay` | S1.open + S2.open | S1 chiuso + S2 chiuso | `classList.remove('open')` su entrambi | ✅ sì |
| T4b | tasto `Escape` | `document` (keydown globale) | S1.open + S2.open (e/o M1-open) | S1/S2 chiusi + M1 chiuso | chiude contestualmente sidebar mobile E modale in un solo handler | ✅ sì |
| T5 | click "×" / "Annulla" / backdrop / Escape | `#closeModal`, `#cancelModal`, `#modal` (e.target===modal), `Escape` | M1-open | M1 (chiuso) | tutti e 4 convergono su `setModal(false)` | ✅ sì |
| T6 | click "Crea cliente" | ultimo bottone `.modal-footer .btn` (footer, senza id) | M1-open | — | **nessun handler JS presente** | ❌ no — azione CRUD "create" da implementare in Angular (dispatch NgRx) |
| T7 | click "Esporta CSV" | `.actions .btn.secondary` | S4.1 | — | **nessun handler JS presente** | ❌ no |
| T8 | click "↻" refresh tabella | `.card-header .icon-btn` (dentro card Elenco clienti) | S4.3 | — | **nessun handler JS presente** | ❌ no |
| T9 | filtri (Ricerca/Stato/Segmento/Account manager, Reset, Filtra) | `.filters`, `.filter-actions` | S4.3.a | — | **nessun handler JS presente** | ❌ no — filtro dati in-page da implementare (probabile NgRx action `loadClienti` con parametri filtro) |
| T10 | click "✎" / "⋯" su riga tabella | `.row-actions .icon-btn` | S4.3.b | — | **nessun handler JS presente** | ❌ no — azioni CRUD edit/menu contestuale presunte, non implementate nel sorgente |
| T11 | click paginazione (`‹ 1 2 3 4 … 321 ›`) | `.table-footer .pagination .page` | S4.3.c | — | **nessun handler JS presente** | ❌ no — markup statico, pagina "1" hardcoded |
| T12 | click "Annulla" form Profilo | `.form-footer .btn.secondary` (type=button) | S4.4 | — | **nessun handler JS presente** | ❌ no |
| T13 | click "+" Attività recenti | `aside .card-header .icon-btn` | S4.5 | — | **nessun handler JS presente** | ❌ no |
| T14 | click "🔔" notifiche | `.topbar .icon-btn` | S3 | — | **nessun handler JS presente** | ❌ no |

> Le transizioni T6-T14 sono elementi **CRUD/filtro/paginazione presunti** (già segnalati come "verificati e scartati come non-navigazione" in `gate1-menu-analysis.md` §4): non hanno comportamento JS nel sorgente, ma vanno comunque previsti come punti di estensione funzionale nella libreria Angular (dispatch di action NgRx, es. `ClientiActions.loadClienti({filters})`, `ClientiActions.createCliente(payload)`, `ClientiActions.setPage(n)`), poiché rappresentano l'intento CRUD-style del prototipo (`source-discovery.md` §3.6).

---

## 5. Wizard-step / tab

**Nessuno.** Confermato da `gate1-menu-analysis.md` §4 ("Meccanismi di navigazione espressamente cercati e non trovati: tab-navigazione... "): il sorgente `angular-responsive-golden-master.html` non contiene alcun elemento `.tab`/`role="tab"` né alcun meccanismo wizard multi-step. La Dashboard è una vista singola non paginata via router, con un solo overlay modale (M1) a singolo step (nessun `wizardStates` come nel file TimeVision fuori scope).

---

## 6. Azioni CRUD identificate

| Azione | Entità | Stato UI coinvolto | Implementata nel sorgente | Selettore |
|---|---|---|---|---|
| Create | Cliente | M1-open → "Crea cliente" | ❌ no (T6) | `.modal-footer .btn` (ultimo, senza id) |
| Read/List | Clienti (tabella) | S4.3.b | ✅ sì (dati statici mock, 4 righe di 1284) | `.table-wrap table tbody tr` |
| Update | Cliente (profilo commerciale) | S4.4 → submit `#profile` | ✅ sì (solo alert demo, T2) | `#profile` |
| Delete | — | — | non presente nel sorgente (nessun bottone/handler di eliminazione cliente) | — |
| Filtro | Clienti (elenco) | S4.3.a | ❌ no (T9) | `.filters` |
| Paginazione | Clienti (elenco) | S4.3.c | ❌ no (T11) | `.table-footer .pagination` |

---

## 7. Filtri/paginazione — dettaglio

- **Filtri** (`S4.3.a`): 4 campi — Ricerca (input testo libero), Stato (select: Tutti/Attivo/In attesa/Sospeso), Segmento (select: Tutti/Enterprise/PMI/Startup), Account manager (select: Tutti/Giulia Rossi/Marco Bianchi) + 2 bottoni azione (Reset, Filtra). Layout a griglia `minmax(220px,2fr) repeat(3,minmax(150px,1fr)) auto`, collassa a 2 colonne sotto 1180px e 1 colonna sotto 680px.
- **Paginazione** (`S4.3.c`): 7 bottoni (`‹`, `1`[active], `2`, `3`, `4`, `…`, `321`, `›`) — totale dichiarato "Mostrati 1–4 di 1284 clienti". Nessun listener JS: la lib Angular dovrà implementare la logica di paginazione (probabile `MatPaginator` o pattern custom coerente con §2 dell'anatomia prodotto, dato che qui non c'è riferimento a `mat-table`/`mat-paginator` nel sorgente nativo).

---

## 8. Esito Phase 2

✅ Flusso di interazione completo della sezione **Dashboard** ricostruito: 1 vista principale (S4) con 5 sotto-blocchi (S4.1–S4.5), 1 modale a singolo step (M1/M1-open), 2 meccanismi trasversali di sidebar mobile (S1/S2), 14 transizioni mappate (5 implementate nel sorgente: T1-T5/T4b, 9 presunte/non implementate: T6-T14 da prevedere come estensioni CRUD/filtro/paginazione in fase di generazione Angular).

⚠️ Nessun wizard-step, nessun tab, nessuna sotto-pagina fisica presenti per questa sezione — la Dashboard è una vista singola con 1 solo overlay modale.

➡️ Pronto per la Phase 3 (dialog/modali) che potrà approfondire nel dettaglio la struttura del form M1-open già anticipata qui al §3.
