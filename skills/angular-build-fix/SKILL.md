# Angular Build Fix

**Scopo**: Diagnosticare e correggere errori di build Angular fino a compilazione pulita.

## Errori comuni e fix

| Errore | Fix |
|---|---|
| `Cannot find module 'lib-name'` | `ng build lib-name` prima di `ng serve` |
| `standalone: true` nel NgModule | Aggiungere `standalone: false` al `@Component` |
| `TS2307: Cannot find module` | Aggiungere path alias in `tsconfig.json` |
| `NG6008: Component is standalone` | `declarations` → `imports` nel NgModule |
| `Can't find stylesheet` | Verificare path relativo `@use` |
| `Duplicate key` in tsconfig | Rimuovere il duplicato in `compilerOptions.paths` |
| `formGroup` non known property | Aggiungere `ReactiveFormsModule` agli imports |
| `ng-packagr missing` | Copiare `ng-package.json`, `tsconfig.lib.json` da lib simile |

## Workflow fix
1. Esegui `ng build {lib}` — copia gli errori
2. Applica fix uno per uno
3. Re-build fino a 0 errori
4. Poi esegui `ng serve`

## Regola CRITICA: sequenza build
```bash
npx ng build {lib-name} --configuration=development  # prima
npx ng serve --port 4200                              # poi
# MAI ng serve senza aver prima buildato la lib
```
