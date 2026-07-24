# Component splitting rules

## Regola base

Un prototipo non deve mai diventare un macro componente.

## Blocchi da separare

- toolbar;
- filtri;
- form;
- summary card;
- tabella;
- griglia;
- planner;
- sidebar;
- empty state;
- dialog;
- footer actions.

## Folder obbligatoria

Ogni componente sotto `components/` deve avere la propria folder:

```txt
components/<feature>-<component>/
```

Ogni folder deve contenere:

```txt
.component.ts
.component.html
.component.scss
.responsive.scss
.theme.scss
```
