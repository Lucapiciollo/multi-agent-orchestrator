# Angular Library Architecture Skill

## Struttura richiesta

- `components/` con una cartella per componente.
- `pages/` per container e route.
- `services/` per logica applicativa.
- `store/` per stato condiviso.
- `models/`, `adapters/`, `guards/`, `resolvers/`.
- modulo principale e modulo routing.
- public API esplicita.

## Regole

- Angular non-standalone salvo richiesta contraria.
- Componenti presentazionali separati dai container.
- Nessuna logica di dominio nei template.
- Tipizzazione strict.
- API pubblica minima.
- Evitare duplicazioni.
- Non importare SCSS grafici tra versioni indipendenti.
- Preferire facade per accesso allo store.
