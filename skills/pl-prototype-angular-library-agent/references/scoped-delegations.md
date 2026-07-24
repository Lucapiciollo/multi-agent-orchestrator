# Scoped delegations

La skill orchestratrice deve delegare responsive e dark mode solo dentro la libreria generata.

## Responsive

Delegare a:

```txt
PL Responsive Layout Intelligence Agent
```

Scope consentito:

```txt
projects/<feature>/src/lib/**/*.responsive.scss
```

## Dark mode

Delegare a:

```txt
PL Dark Mode Agent
```

Scope consentito:

```txt
projects/<feature>/src/lib/**/*.theme.scss
projects/<feature>/src/lib/styles/_<feature>-tokens.scss
projects/<feature>/src/lib/styles/_<feature>-theme.scss
```

## Vietato

- modificare `src/styles.scss`;
- modificare temi globali;
- modificare altre librerie;
- creare override globali non scoped.
