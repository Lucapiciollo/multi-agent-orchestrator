# HTML → Angular Skill

## Obiettivo

Convertire un prototipo HTML/CSS/JS in una libreria Angular mantenendo struttura, comportamento e fedeltà visiva.

## Regole

- Analizzare prima pagine, sezioni, componenti ripetuti e navigazione.
- Non creare un macro-componente.
- Ogni componente deve avere una cartella dedicata sotto `components/`.
- Preferire moduli Angular non-standalone.
- Separare template, TypeScript e SCSS.
- Usare Angular Material per componenti applicativi e interattivi.
- Usare Bootstrap per grid, flex, spacing e wrapper strutturali quando non altera il pixel-perfect.
- Integrare `pl-dynamic-form`, `jx-cell` e `ux-design` solo dove appropriato.
- Non modificare librerie condivise senza consenso esplicito.
- Conservare il comportamento tramite servizi, adapter e facade.

## Versionamento

- `version1` e `version2` devono avere moduli Material e SCSS indipendenti.
- Token, mixin, responsive, override Material, tema e stili componente devono essere separati per versione.
- `index` e `store` possono restare condivisi ma non devono contenere temi specifici.

## Validazione

- Build della libreria.
- Routing funzionante.
- Nessuna dipendenza circolare.
- Confronto visuale.
- Nessun file fuori scope.
