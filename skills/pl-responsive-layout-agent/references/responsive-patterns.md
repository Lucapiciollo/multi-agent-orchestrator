# Responsive patterns

## Strategia

1. Flexbox se basta.
2. Grid se serve struttura.
3. Scroll orizzontale se il componente complesso deve restare largo.
4. File `.responsive.scss` separati.
5. Nessuna modifica distruttiva.

## Decisione rapida

| Componente | Strategia |
|---|---|
| Toolbar | Flex wrap |
| Filtri | Flex wrap |
| Form | Grid + stack mobile |
| Card libere | Flex wrap |
| Card ordinate | Grid auto-fit |
| Tabella semplice | Cardify o scroll |
| Tabella complessa | Scroll orizzontale |
| Calendario/planner | Scroll orizzontale |
| Dialog | Fullscreen mobile |
| Sidebar | Stack/drawer |
