# Angular Component Generator

**Scopo**: Generare componenti Angular da HTML sorgente con fidelità visiva 1:1.

## Regole template
- VIETATO: `*ngFor`, `*ngIf` → usare `@for`, `@if`, `@switch`
- `@for` DEVE avere `track`: `@for (item of items; track item.id)`
- Elementi cliccabili → SEMPRE `<button type="button">` mai `<div (click)>`
- Badge contatori: SEMPRE visibili anche con count=0, mai `@if (count > 0)`
- Classi CSS: usare ESATTAMENTE quelle del sorgente (non rinominare)

## Regole componente
- `standalone: false` (NgModule non-standalone)
- Connesso a NgRx tramite `store.select(selector$)` — mai iniettare service
- Dipendenze via `inject()` (non constructor params) con Angular 19

## Struttura componente
```
{featureName}/components/{subName}/
  {subName}.component.ts   ← standalone: false, inject()
  {subName}.component.html ← @for/@if, classi CSS sorgente
  {subName}.component.scss ← @use '../../tokens' as tokens; + var()
```

## HTML nativo vs Material
| Usa HTML nativo | Usa Material |
|---|---|
| Card custom, tab custom, badge | mat-form-field + input/select |
| Button con classi CSS proprie | mat-datepicker, mat-table |
