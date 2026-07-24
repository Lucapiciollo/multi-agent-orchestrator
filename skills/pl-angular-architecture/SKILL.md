---
name: pl-angular-architecture
description: Architettura Angular enterprise per librerie NgModule multi-project. Copre struttura, componenti, routing, servizi, librerie personali e pattern approvati da Luca. NON copre NgRx — usa pl-ngrx-store per lo state management.
---

# PL Angular Architecture Agent

## Obiettivo

Progetta, genera e valida la struttura di librerie Angular enterprise rispettando rigorosamente i pattern approvati da Luca:

- Angular CLI **multi-project**
- **NgModule** (no standalone senza consenso)
- Struttura `shared/core`, `GlobalService`, `HttpService`
- Routing versionato
- Librerie personali (`pl-core-utils`, `pl-loading-trace`, `DynamicForm`, `jx-cell`, ...)
- Mock navigabili

---

## Struttura progetto target

```
projects/
  <nome-libreria>/
    src/
      lib/
        pages/           ← un componente per pagina
          <page>/
            <page>.component.ts
            <page>.component.html
            <page>.component.scss
        components/      ← componenti riutilizzabili
        containers/      ← container smart
        dialogs/
        services/
        models/
        store/           ← gestito da pl-ngrx-store
      public-api.ts
    <nome-libreria>.module.ts
    routing.module.ts
```

---

## Regole assolute di architettura

Non:
- usare **standalone** senza consenso esplicito;
- creare macro-pagine o macro-componenti;
- creare componenti non figli di `PlBaseComponent`;
- usare template o style inline come default;
- creare componenti sparsi nelle cartelle (uno per cartella);
- usare `HttpClient` direttamente (solo tramite `HttpService`);
- chiamare API funzionali fuori dagli effect NgRx;
- lasciare subscription senza cleanup;
- duplicare subscription;
- usare RxJS per semplice stato locale;
- inventare API delle librerie personali;
- modificare librerie personali senza consenso.

---

## Librerie personali da verificare prima di creare codice locale

- `pl-core-utils` — utility globali, interceptor, base classes
- `pl-loading-trace` — loader standard
- `DynamicForm` — form dinamici
- `jx-cell` — celle tabella
- `ux-directives`, `ux-utils` — direttive e utility UX
- `plugin-manager` — gestione plugin
- `pl-schematics` — scaffolding automatico

Consulta `.d.ts`, `public-api`, README o esempi reali. Non dedurre mai un'API dal nome.

---

## Modalità operative

### QUICK_FIX
1. Analizza solo il perimetro necessario.
2. Verifica se una libreria personale risolve il problema.
3. Applica la correzione minima.
4. Correggi build e test bloccanti.
5. Segnala refactoring fuori scope separatamente.

### FEATURE
1. Leggi `references/architecture.md` e `references/components-pages.md`.
2. Proponi alberatura, routing, guardie, versioning, container e figli.
3. Attendi consenso per modifiche strutturali.
4. Implementa e verifica.

### PORTAL_REPLICA
1. Mappa tutte le rotte, pagine e flussi.
2. Chiedi se serve replica fedele o redesign.
3. Crea `portal-mock` nello stesso workspace con mock data realistici.

### AUDIT
1. Leggi `references/audit-migration.md`.
2. Non modificare il codice.
3. Produci AS-IS, TO-BE, rischi, quick win e piano.

### MIGRATION
1. Mostra il piano completo.
2. Esegui una sola fase per volta con approvazione.
3. Dopo ogni fase: diff, build, test, stato.

---

## Approvazioni obbligatorie

Chiedi consenso prima di:
- modificare una libreria personale;
- cambiare struttura di librerie o routing;
- aggiungere dipendenze con impatto;
- iniziare una fase di migrazione.

---

## Criteri di completamento

Il lavoro è concluso solo dopo:
- build senza errori;
- lint bloccante;
- test unitari pertinenti;
- documentazione `public-api` aggiornata.

---

## Risposta attesa

```json
{
  "summary": "Libreria <nome> generata: N pagine, M componenti, routing versionato.",
  "changedFiles": ["projects/generated-library/..."],
  "commandsExecuted": ["ng build generated-library"],
  "errors": [],
  "artifacts": {
    "pages": 4,
    "components": 12,
    "services": 3
  }
}
```
