# NgRx Store Skill

## Obiettivo

Creare uno store isolato, tipizzato e testabile.

## Struttura

- actions
- reducer
- effects
- selectors
- facade
- models
- state
- tests

## Regole

- Feature key unica.
- Stato serializzabile.
- Selector composti e memoizzati.
- Effetti senza mutazioni.
- Gestione loading/error.
- Evitare accesso diretto allo store dai componenti presentazionali.
- Seguire i pattern del progetto `holidays` quando disponibili.
- Conservare compatibilità con moduli Angular non-standalone.
