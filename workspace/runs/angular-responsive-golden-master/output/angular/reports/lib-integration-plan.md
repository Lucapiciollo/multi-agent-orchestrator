# Piano di integrazione libreria — angular-responsive-golden-master

**Generato:** 2026-07-31T17:53:16+02:00
**Stato:** ⚠️ BLOCCATO — libreria sorgente non trovata

---

## 1. Scansione eseguita

Percorso scansionato (run-scoped, come da override obbligatorio):

```
workspace/runs/angular-responsive-golden-master/output/test-app/src/libs/
```

**Risultato:** la directory **non esiste**. Nessuna sottocartella di libreria è presente da scansionare.

Verificato anche l'input aggiuntivo:
```
workspace/runs/angular-responsive-golden-master/output/angular/reports/architecture-report.md
```
**Risultato:** anche questo file **non esiste** nella directory reports del run (presenti solo: `gate1-menu-analysis.md`, `js-classification.md`, `section-flow.md`, `selected-section.md`, `source-discovery.md`).

> Nota: esiste una cartella legacy `workspace/output/test-app/` (fuori dal prefisso `runs/`), ma per le regole ferree di questo run **non può essere letta né usata come fonte**, quindi non è stata ispezionata.

## 2. Causa

Questo task dipende dall'output di `angular-lib-agent` (generazione della libreria) e `test-webapp-agent` (scaffold della test-app), che devono scrivere in:
```
workspace/runs/angular-responsive-golden-master/output/test-app/
```
Tali agenti non risultano aver ancora eseguito (o completato) nel contesto di questo run, quindi non c'è nessun `index.module.ts` da leggere per ricavare nome NgModule e selector prefix.

## 3. Informazioni desumibili dal contesto disponibile

Dal contesto del run (`context/routing-map.json` e `output/angular/reports/selected-section.md`) risulta che:

- **Sezione selezionata (vincolante):** `Dashboard` (slug atteso: `dashboard`)
- **Route di default:** `dashboard`
- Altre route di livello 0 pianificate ma non ancora generate come lib: `clienti`, `contratti`, `report`, `impostazioni`

Sulla base di questi dati, la libreria attesa una volta generata sarebbe:

| Campo | Valore atteso (non confermato — file sorgente assente) |
|---|---|
| Nome lib (slug) | `dashboard` |
| Percorso sorgente atteso | `workspace/runs/angular-responsive-golden-master/output/test-app/src/libs/dashboard/` |
| Percorso destinazione | `test-webapp/projects/dashboard/` |
| Nome package | `@app/dashboard` |
| NgModule / selector prefix | **N/D** — non determinabile: `index.module.ts` non presente da leggere |
| File da copiare | **N/D** — impossibile enumerare, la cartella sorgente non esiste |

## 4. Azioni richieste prima di poter completare questo task

1. Eseguire `angular-lib-agent` per generare la libreria in `workspace/runs/angular-responsive-golden-master/output/test-app/src/libs/dashboard/` (o nella slug effettivamente selezionata).
2. Rieseguire questo task (`discover-generated-lib`) una volta che `index.module.ts` è disponibile, per confermare nome NgModule, selector prefix ed elenco file reali.

## 5. Conclusione

Nessuna integrazione (routing, angular.json, tsconfig, build) può essere eseguita in modo affidabile finché la libreria sorgente non esiste fisicamente nel percorso run-scoped indicato. Questo piano documenta lo stato di blocco e i dati di contesto già disponibili per accelerare il retry.
