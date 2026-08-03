# CSS to Design Tokens

**Scopo**: Convertire CSS estratto in un sistema di design token SCSS a 3 livelli.

## Output
- `workspace/output/scss/_tokens.scss` — variabili SCSS + mixin host-properties
- `workspace/output/scss/main.scss` — import principale (esportabile dal consumer)
- `workspace/output/scss/reports/extraction-report.md`

## Struttura _tokens.scss
```scss
// 1. Breakpoint responsivi
$bp-xl: Xpx; $bp-lg: Xpx; $bp-sm: Xpx; $bp-xs: Xpx;
// 2. Token colore (dal :root del sorgente)
$color-primary: #xxx;
// 3. Token spazio/raggio
$radius: Xpx;
// 4. Mixin — emette CSS custom props su :host
@mixin host-properties { --primary: #{$color-primary}; ... }
```

## Regole
1. Ricava i token dal blocco `:root` del CSS sorgente — valori ESATTI
2. Ogni valore duplicato in 3+ posti diventa variabile `$radius-sm` etc.
3. `main.scss` fa solo `@forward` dei partial — nessuno stile inline
4. Verifica che `@use 'workspace/output/scss/main'` compili senza errori Sass
