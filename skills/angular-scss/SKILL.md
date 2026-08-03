# Angular SCSS Migration

**Scopo**: Migrare CSS hardcoded a SCSS con design token e CSS custom properties.

## Struttura SCSS lib (a livello lib, non webapp)
```
projects/lib-{name}/src/
  _tokens.scss         ← $breakpoints + $colors + @mixin host-properties
  lib/
    lib-{name}.theme.scss  ← CSS globale + :root (importato dal consumer)
    index.component.scss   ← @include tokens.host-properties (UNICA chiamata)
    components/**          ← @use '../../../tokens' as tokens; + var(--nome)
```

## Regole
1. `_tokens.scss` è la UNICA fonte di verità per la lib
2. `host-properties` mixin chiamato SOLO in `index.component.scss`
3. Componenti figli usano SOLO `var(--nome)` — non hardcoded, non tokens.$color
4. Breakpoint nei media query: `@media (max-width: tokens.$bp-sm)`
5. Valori duplicati in 3+ file → variabile `$radius-sm` in `_tokens.scss`

## Consumer (styles.scss)
```scss
@use '../projects/lib-{name}/src/lib/lib-{name}.theme';
```

## CDK overlay (dialog/backdrop)
Aggiungere in `lib-{name}.theme.scss`:
```scss
.my-dialog-panel { border: none !important; background: transparent !important; }
```
