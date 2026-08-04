# Angular Lib Packager

**Scopo**: Trasforma il codice Angular generato in una libreria ng-packagr **production-ready**, importabile con `import { LibModule } from 'lib-name'`.

## Prerequisiti
- La lib è già in `workspace/runs/{slug}/output/test-app/src/libs/{libName}/`
- `test-webapp/` esiste con `angular.json` e `tsconfig.json`

---

## Step da eseguire (in ordine)

### 1. Leggi il codice generato
Scansiona `workspace/runs/{slug}/output/test-app/src/libs/{libName}/` e individua:
- Il nome NgModule (da `index.module.ts` → `export class {Name}Module`)
- Il prefisso selector (da `index.component.ts` → `selector: 'lib-...'`)
- I componenti dichiarati, i dialogs, il service, i modelli

### 2. Copia la lib in test-webapp/projects/{libName}/

```
test-webapp/projects/{libName}/
  src/
    lib/                  ← copia tutto da workspace/.../libs/{libName}/
      index.module.ts
      index.component.ts/html/scss
      index.service.ts
      index.models.ts
      index.guard.ts
      components/
      dialogs/
      redux/
      mock-data/
    public-api.ts         ← crea (vedi sotto)
    _tokens.scss          ← copia da workspace se esiste
  ng-package.json         ← crea
  package.json            ← crea
  tsconfig.lib.json       ← crea
  tsconfig.lib.prod.json  ← crea
  tsconfig.spec.json      ← crea
  lib-{name}.theme.scss   ← crea (vedi sotto)
```

### 3. Crea public-api.ts

```typescript
// public-api.ts — entry point della libreria
// Esporta TUTTO ciò che il consumer deve poter importare

export * from './lib/index.module';
export * from './lib/index.models';
export * from './lib/index.service';
export * from './lib/index.component';
// export * from './lib/index.guard';  ← opzionale

// Re-export del token per il switch mock→BE
// export { FEATURE_API_BASE_URL } from './lib/index.service';
```

### 4. Crea ng-package.json

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/{libName}",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

### 5. Crea package.json

```json
{
  "name": "{libName}",
  "version": "0.0.1",
  "peerDependencies": {
    "@angular/common": "^19.0.0",
    "@angular/core": "^19.0.0"
  }
}
```

### 6. Crea tsconfig.lib.json (copia da lib-report esistente)

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/lib",
    "declaration": true,
    "declarationMap": true,
    "inlineSources": true,
    "types": []
  },
  "exclude": ["**/*.spec.ts"]
}
```

### 7. Crea tsconfig.lib.prod.json

```json
{
  "extends": "./tsconfig.lib.json",
  "compilerOptions": { "declarationMap": false },
  "angularCompilerOptions": { "compilationMode": "partial" }
}
```

### 8. Crea tsconfig.spec.json

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "outDir": "../../out-tsc/spec", "types": ["jasmine"] },
  "include": ["**/*.spec.ts", "**/*.d.ts"]
}
```

### 9. Crea lib-{name}.theme.scss

Il consumer deve importare questo file in `styles.scss`.  
Contiene:
- CSS custom properties della lib (`:root { --primary: ...; }` estratte da `_tokens.scss`)
- Stili globali CDK overlay (dialog panel, backdrop)

```scss
// lib-{name}.theme.scss
// Consumer: @use '../projects/{libName}/src/lib-{name}.theme';

// ── CSS custom properties (esposte globalmente) ──────────────────────
:root {
  --primary: #3b5ccc;     /* ← dai token della lib */
  --bg: #f5f7fb;
  /* ... altri token */
}

// ── CDK overlay / dialog ─────────────────────────────────────────────
.{libName}-dialog-panel {
  border: none !important;
  background: transparent !important;
  .mat-mdc-dialog-container .mdc-dialog__surface {
    padding: 0 !important; overflow: hidden !important;
    border-radius: 12px !important; border: none !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.24), 0 2px 8px rgba(0,0,0,0.12) !important;
  }
  .mat-mdc-dialog-container { padding: 0 !important; border: none !important; background: transparent !important; }
}
```

### 10. Aggiorna angular.json

Aggiungi nel blocco `projects`:
```json
"{libName}": {
  "projectType": "library",
  "root": "projects/{libName}",
  "sourceRoot": "projects/{libName}/src",
  "prefix": "lib-{shortName}",
  "architect": {
    "build": {
      "builder": "@angular-devkit/build-angular:ng-packagr",
      "options": {
        "project": "projects/{libName}/ng-package.json"
      },
      "configurations": {
        "production": { "tsConfig": "projects/{libName}/tsconfig.lib.prod.json" },
        "development": { "tsConfig": "projects/{libName}/tsconfig.lib.json" }
      }
    }
  }
}
```

### 11. Aggiorna tsconfig.json

Nel blocco `compilerOptions.paths` (NON duplicare se già presente):
```json
"{libName}": ["dist/{libName}"]
```

### 12. Aggiungi _tokens.scss se mancante

Se la lib usa `@use '../../../tokens' as tokens` ma `src/_tokens.scss` non esiste,
copialo da `workspace/runs/{slug}/output/test-app/src/libs/_tokens.scss`.

### 13. Verifica standalone: false

Tutti i `@Component`, `@Directive`, `@Pipe` della lib devono avere `standalone: false`.
Se manca, aggiungilo prima del decorator:
```typescript
// ❌ manca standalone: false → Angular 19 li tratta come standalone
@Component({ selector: 'lib-xyz', ... })

// ✅ corretto
@Component({ standalone: false, selector: 'lib-xyz', ... })
```

### 14. Build di verifica

```bash
cd test-webapp
npx ng build {libName} --configuration=development
```

Se fallisce, analizza ogni errore e applicare il fix corrispondente (vedi skill angular-build-fix).

---

## Output atteso

Dopo questa skill il consumer può fare:

```typescript
// app.module.ts o feature.module.ts
import { {Name}Module } from '{libName}';
```

```scss
/* styles.scss */
@use '../projects/{libName}/src/lib-{libName}.theme';
```

```bash
npx ng build {libName} --configuration=development
npx ng serve --port 4200
```
