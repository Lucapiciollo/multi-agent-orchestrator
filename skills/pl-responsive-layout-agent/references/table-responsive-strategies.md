# Table responsive strategies

## Scelta strategia

### Cardify

Usare per tabelle semplici dove ogni riga è un'entità indipendente.

### Hide secondary columns

Usare solo se le colonne nascoste sono davvero secondarie.

### Horizontal scroll

Usare per tabelle complesse, calendari, planner, griglie turni, spreadsheet e confronti.

## Pattern scroll

```scss
.table-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}

.table-wrapper table {
  min-width: 920px;
}
```
