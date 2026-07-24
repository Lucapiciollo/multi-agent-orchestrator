# Anti-breaking rules

## Confine operativo

Modificare solo:

```txt
projects/<feature>/
```

## Vietato

- app.module.ts;
- app-routing.module.ts;
- angular.json;
- package.json root;
- src/styles.scss;
- src/theme.scss;
- altre librerie;
- librerie personali.

## Rollback

Una generazione è sicura se il rollback consiste solo in:

```txt
rm -rf projects/<feature>
```
