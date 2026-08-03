# Phase 4 — JavaScript Discovery & Mandatory Classification

**Run:** `angular-responsive-golden-master`
**Step:** `step-04-js-discovery-classification`
**Sezione in scope (vincolante):** `Dashboard` — voce **[1]** di `gate1-menu-analysis.md`, confermata in `selected-section.md`. Nessuna ridiscussione della scelta.
**Sorgente analizzato:** `workspace/input/angular-responsive-golden-master.html` (unico file in scope per questo run — `timevision-report-v128 1.html` è fuori scope, come già stabilito in `source-discovery.md` §4 e §5).
**Input di riferimento:** `workspace/output/angular/reports/section-flow.md` (Phase 2 — flusso di interazione e transizioni T1-T14 già mappate).
**Modalità:** sola analisi — nessuna generazione di codice Angular in questo step.

---

## 1. Perimetro dello scan JavaScript

Il sorgente contiene **un solo blocco `<script>`** inline (riga 44 dell'HTML), non minificato in file esterni, nessuna libreria vendor, nessun modulo/bundle. Nessun altro file `.js` esterno è referenziato (`source-discovery.md` §3.4: "Nessuno script esterno, nessun bundler/modulo").

Il blocco è stato scomposto in **11 snippet atomici** (JS-001 → JS-011), ciascuno corrispondente a una singola dichiarazione/handler/funzione, per consentire una classificazione 1:1 con la matrice di migrazione della skill `html-angular-architect`.

Ambito di appartenenza rispetto alla sezione "Dashboard" (da `section-flow.md` §1):
- **JS-001 → JS-003**: meccanismi trasversali del **guscio applicativo** (sidebar mobile + overlay) — non sono comportamento della vista Dashboard in sé, ma wrappano il layout in cui essa è renderizzata (già segnalati con ★ in Gate 1). Documentati qui perché "rilevanti per la sezione selezionata" (la Dashboard vive dentro questo shell), ma la strategia di migrazione li colloca nel componente shell dell'app consumer, **non** nella libreria Angular della feature "Dashboard/Gestione clienti".
- **JS-004 → JS-010**: comportamento del **modale "Nuovo cliente" (M1/M1-open)**, parte integrante della sezione Dashboard (`section-flow.md` §2, riga M1/M1-open) — in scope pieno per la libreria Angular generata.
- **JS-011**: submit del form "Profilo commerciale" (`#profile`, S4.4) — in scope pieno per la libreria Angular generata.

---

## 2. Matrice di classificazione JS-NNN

| ID | Riga sorgente / selettore | Codice originale (estratto) | Comportamento osservato | Classificazione (schema obbligatorio) | Riferimento `section-flow.md` | Strategia di migrazione Angular proposta |
|---|---|---|---|---|---|---|
| **JS-001** | `const sidebar=document.getElementById('sidebar'),overlay=document.getElementById('overlay');` | Cache di riferimenti DOM per sidebar e overlay | Query DOM diretta, nessuna manipolazione | **Stato UI locale / riferimento a elemento** | supporto a T3/T4 | Eliminare l'accesso diretto al DOM. Nel componente shell dell'app consumer (fuori dalla lib Dashboard): stato booleano `isSidebarOpen = false` gestito come **component state**; il template lega le classi con `[class.open]="isSidebarOpen"` sia su `.sidebar` sia su `.overlay`. Nessun `ViewChild`/`ElementRef` necessario. |
| **JS-002** | `document.getElementById('menu').onclick=()=>{sidebar.classList.add('open');overlay.classList.add('open')}` | Click su `#menu` (hamburger) → aggiunge `.open` a sidebar e overlay | DOM behavior (toggle classe CSS) | **DOM behavior → directive / component state** | T3 | Componente shell: `(click)="onToggleMenu()"` su `<button class="icon-btn menu-btn">`; metodo `onToggleMenu() { this.isSidebarOpen = true; }`. Se il pattern si ripete su più shell, incapsulare in una `SidebarToggleDirective` riutilizzabile (`[appSidebarToggle]`). Fuori dallo scope della lib "Dashboard" (shell applicativo). |
| **JS-003** | `overlay.onclick=()=>{sidebar.classList.remove('open');overlay.classList.remove('open')}` | Click su `#overlay` → rimuove `.open` da sidebar e overlay | DOM behavior (toggle classe CSS) | **DOM behavior → directive / component state** | T4 | Componente shell: `(click)="onCloseMenu()"` sull'elemento `.overlay`; `onCloseMenu() { this.isSidebarOpen = false; }`. Stessa directive riutilizzabile di JS-002. Fuori dallo scope della lib "Dashboard". |
| **JS-004** | `const modal=document.getElementById('modal');` | Cache riferimento DOM del modale | Query DOM diretta, nessuna manipolazione | **Stato UI locale / riferimento a elemento** | supporto a T1/T5 | Sostituito interamente dal pattern `MatDialog` (§4 della skill): nessun riferimento diretto al nodo DOM. Lo stato "aperto/chiuso" è gestito dal ciclo di vita del `MatDialogRef` restituito da `this.dialog.open(NuovoClienteDialogComponent, {...})`. |
| **JS-005** | `function setModal(v){modal.classList.toggle('open',v);document.body.style.overflow=v?'hidden':'';if(v)setTimeout(()=>document.getElementById('firstFocus').focus(),50)}` | Funzione centrale: toggla classe `.open` sul modale, blocca lo scroll di `body`, e dopo 50ms imposta il focus sul campo `#firstFocus` ("Nome *") quando si apre | Comportamento composito: (a) DOM behavior/stato UI locale — apertura/chiusura modale; (b) side-effect globale — scroll lock; (c) gestione focus | **(a) Stato UI locale + (b) DOM behavior → directive + (c) gestione focus → Angular CDK / component lifecycle** | T1, T5 | **(a)** Interamente sostituito da `MatDialog.open()` / chiusura via `dialogRef.close()` — nessuno stato booleano manuale necessario, il ciclo di vita è gestito da Angular CDK Overlay. **(b)** Lo scroll-lock di `body` è **automatico con `MatDialog`** (CDK applica `cdk-global-overlay-wrapper` + blocca lo scroll del body di default) → nessun codice equivalente da scrivere. **(c)** Il focus automatico su "Nome" si ottiene con l'attributo `cdkFocusInitial` sul primo `<input>` del dialog component (`<input cdkFocusInitial formControlName="nome">`), che rimpiazza `setTimeout(...,50)` + `.focus()` manuale in modo dichiarativo e senza race condition. |
| **JS-006** | `document.getElementById('openModal').onclick=()=>setModal(true);` | Click su "+ Nuovo cliente" → apre il modale | Navigazione/apertura overlay | **DOM behavior → apertura dialog (component method)** | T1 | Nel componente Dashboard (`index.component.ts`): `(click)="onOpenNuovoCliente()"`; `onOpenNuovoCliente() { this.dialog.open(NuovoClienteDialogComponent, { width: '620px', maxWidth: '95vw', panelClass: 'nuovo-cliente-panel', backdropClass: 'nuovo-cliente-backdrop' }); }` — rispetta la regola ferrea `panelClass = .cdk-overlay-pane` (§4 della skill). |
| **JS-007** | `document.getElementById('closeModal').onclick=()=>setModal(false);` | Click su "×" → chiude il modale | DOM behavior (chiusura overlay) | **DOM behavior → component method (dialog close)** | T5 | Nel dialog component: `(click)="dialogRef.close()"` sul bottone `.icon-btn` "×", oppure `mat-dialog-close` come attributo nativo Material: `<button class="icon-btn" mat-dialog-close>×</button>`. |
| **JS-008** | `document.getElementById('cancelModal').onclick=()=>setModal(false);` | Click su "Annulla" (footer) → chiude il modale | DOM behavior (chiusura overlay) | **DOM behavior → component method (dialog close)** | T5 | Stesso pattern di JS-007: `<button class="btn secondary" mat-dialog-close>Annulla</button>`. Nessuna logica aggiuntiva (nessun conferma/dirty-check nel sorgente). |
| **JS-009** | `modal.onclick=e=>{if(e.target===modal)setModal(false)};` | Click sull'area di sfondo (backdrop) del modale → chiusura, solo se il target è esattamente il backdrop | DOM behavior (click-outside) | **DOM behavior → gestito nativamente da MatDialog (nessuna directive custom necessaria)** | T5 | `MatDialog` gestisce nativamente il click sul backdrop chiudendo il dialog, a condizione di **non impostare** `disableClose: true` nelle opzioni di apertura (JS-006). Nessun listener manuale da scrivere: comportamento equivalente out-of-the-box. |
| **JS-010** | `document.addEventListener('keydown',e=>{if(e.key==='Escape'){setModal(false);sidebar.classList.remove('open');overlay.classList.remove('open')}});` | Listener globale su `document` per il tasto `Escape`: chiude sia il modale sia la sidebar mobile in un unico handler | Comportamento composito cross-cutting: chiusura modale (in scope Dashboard/dialog) + chiusura sidebar shell (fuori scope Dashboard) | **DOM behavior → directive (HostListener) — split in due responsabilità distinte** | T4b | **Parte modale**: gestita nativamente da `MatDialog` (chiusura su `Escape` è comportamento di default, a meno di `disableClose: true`) → nessun codice equivalente necessario nel dialog component. **Parte sidebar**: nel componente shell dell'app consumer, `@HostListener('document:keydown.escape') onEscape() { this.isSidebarOpen = false; }` (Angular `HostListener` sostituisce il listener globale su `document`). Le due responsabilità **non devono essere fuse** in un unico handler come nel sorgente — vanno separate perché appartengono a due componenti/scope Angular differenti (dialog vs shell). |
| **JS-011** | `document.getElementById('profile').onsubmit=e=>{e.preventDefault();alert('Demo: profilo salvato')};` | Submit del form `#profile` ("Profilo commerciale") → previene il submit nativo e mostra un `alert()` dimostrativo, nessuna persistenza/chiamata di rete | Submit form + feedback utente (nessuna validazione di campo presente nel sorgente: nessun `required`/pattern controllato via JS, solo `*` visivi nel modale, non nel form profilo) | **Navigazione/submit → gestione reactive form + notifica (NON validazione, perché il sorgente non applica regole di validazione JS)** | T2 (S4.4) | Convertire in `ReactiveFormsModule`: `FormGroup` con i campi del form (Nome, Cognome, Azienda, Ruolo, Email, Telefono, Priorità, Prossimo contatto, Note, 3 checkbox). Handler: `onSubmit() { this.store.dispatch(ClientiActions.updateProfilo({ payload: this.form.getRawValue() })); }` — l'`e.preventDefault()` è implicito con `(ngSubmit)`. L'`alert('Demo: profilo salvato')` va sostituito con un feedback UI coerente con Material (es. `MatSnackBar`) agganciato al successo dell'effect NgRx (`updateProfiloSuccess`), **non** con un `alert()` bloccante. Nessun validator reattivo da introdurre ex-novo: il sorgente non applica alcuna regola di validazione JS su questo form (solo il modale "Nuovo cliente" marca campi con `*` visivo, senza enforcement — vedi nota §3). |

---

## 3. Nota — Validazione visuale non applicata via JS

Il modale "Nuovo cliente" marca **Nome**, **Cognome** ed **Email** con un asterisco `*` nel testo della label (puro markup, nessun attributo `required` né logica JS di blocco submit — il bottone "Crea cliente" non ha nemmeno un handler, vedi §4). Non esiste quindi, nel sorgente, alcuno snippet JS di validazione da classificare come "validazione → reactive form validator": si tratta di un **gap funzionale del prototipo**, non di JS da migrare. Viene comunque segnalato come raccomandazione architetturale: in fase di generazione della lib Angular, il dialog `NuovoClienteDialogComponent` dovrebbe introdurre `Validators.required` su Nome/Cognome/Email e `Validators.email` su Email, per allinearsi all'intento visivo del design (asterisco) anche se il sorgente HTML non lo impone via JS.

---

## 4. Elementi con handler assente nel sorgente (non classificabili come JS esistente)

Coerentemente con `section-flow.md` §4 (transizioni T6-T14, tutte marcate "nessun listener JS presente"), i seguenti elementi interattivi della sezione Dashboard **non hanno alcun codice JavaScript associato** nel sorgente e pertanto **non generano un ID JS-NNN** (non c'è nulla da classificare/migrare, solo da implementare ex-novo lato Angular):

| Rif. `section-flow.md` | Elemento | Nota |
|---|---|---|
| T6 | "Crea cliente" (footer modale) | Da implementare come dispatch `ClientiActions.createCliente(payload)` verso il service/mock |
| T7 | "Esporta CSV" | Nessun comportamento sorgente; azione da definire in fase di generazione (fuori scope Phase 4) |
| T8 | "↻" refresh tabella | Nessun comportamento sorgente |
| T9 | Filtri elenco clienti (Ricerca/Stato/Segmento/Account manager, Reset, Filtra) | Da implementare come `ClientiActions.loadClienti({filters})` |
| T10 | "✎" / "⋯" row-actions tabella | Azioni CRUD presunte, non implementate |
| T11 | Paginazione (`‹ 1 2 3 4 … 321 ›`) | Markup statico, nessuna logica; da implementare come `ClientiActions.setPage(n)` o `MatPaginator` |
| T12 | "Annulla" form Profilo commerciale | Nessun handler (nessun reset esplicito nel sorgente) |
| T13 | "+" Attività recenti | Nessun comportamento sorgente |
| T14 | "🔔" notifiche topbar | Nessun comportamento sorgente (shell, fuori scope lib Dashboard) |

Questi elementi restano di competenza della **Phase 8+ (generazione lib Angular)** come estensioni funzionali previste, non della Phase 4 (che si limita alla classificazione del JS *esistente*).

---

## 5. Riepilogo per categoria di classificazione

| Categoria | ID coinvolti | Conteggio |
|---|---|---|
| Stato UI locale / component state | JS-001, JS-004, parte JS-005(a), JS-010(sidebar) | 3 dirette + 1 quota parte |
| DOM behavior → directive / component method | JS-002, JS-003, JS-006, JS-007, JS-008, JS-009, JS-010(sidebar) | 7 |
| Gestione focus → Angular CDK (`cdkFocusInitial`) | JS-005(c) | 1 (quota parte di JS-005) |
| Navigazione/submit → reactive form + NgRx dispatch | JS-011 | 1 |
| Data fetching → NgRx effect/service | — | 0 (nessuna chiamata di rete nel sorgente, confermato da `source-discovery.md` §3.4) |
| Validazione → reactive form validator | — | 0 (nessuna validazione JS presente nel sorgente — vedi gap §3) |
| Animazioni → CSS/Angular animations | — | 0 (le transizioni `.2s` su sidebar/modale sono gestite via CSS `transition`, non JS; restano invariate in SCSS, nessuna migrazione a `@angular/animations` necessaria) |

**Totale snippet JS classificati:** 11 (JS-001 → JS-011)
**Totale funzioni/handler distinti nel blocco `<script>` sorgente:** 11 (copertura 100%)

---

## 6. Esito Phase 4

✅ Individuato e classificato l'intero blocco `<script>` del sorgente (11/11 snippet, nessun residuo non classificato).
✅ Ogni snippet ha ID progressivo (JS-001…JS-011), classificazione secondo lo schema obbligatorio della skill, riferimento incrociato a `section-flow.md` (transizioni T1-T5/T4b) e strategia di migrazione Angular proposta.
⚠️ 3 snippet (JS-001, JS-002, JS-003, JS-010 quota sidebar) appartengono al guscio applicativo (shell) e non rientrano nella libreria Angular della feature "Dashboard/Gestione clienti", ma nel componente shell dell'app consumer — segnalato esplicitamente per evitare fraintendimenti in fase di generazione (Phase 8+).
⚠️ Nessuno snippet di validazione reattiva è presente nel sorgente: il gap è documentato al §3 come raccomandazione, non come migrazione di codice esistente.
⚠️ 9 elementi interattivi (T6-T14) restano privi di handler nel sorgente — non producono ID JS-NNN, elencati al §4 come estensioni funzionali da prevedere nelle fasi successive.

➡️ Pronto per la Phase 5 (component discovery / decomposizione) con una mappa completa e univoca di tutto il comportamento JS esistente e della sua destinazione architetturale Angular.
