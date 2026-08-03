# Lib Integrator

**Scopo**: Integrare una lib Angular generata in test-webapp come progetto ufficiale.

## Prerequisiti
- La lib è in `workspace/output/test-app/src/libs/{libName}/`
- `test-webapp/angular.json` esiste

## Step
1. Copia `workspace/output/test-app/src/libs/{libName}/` → `test-webapp/projects/{libName}/src/lib/`
2. Crea `test-webapp/projects/{libName}/src/public-api.ts` con gli export
3. Crea `test-webapp/projects/{libName}/package.json` (name, version)
4. Copia `ng-package.json`, `tsconfig.lib.json`, `tsconfig.lib.prod.json`, `tsconfig.spec.json` da una lib esistente
5. Aggiorna `test-webapp/angular.json` — blocco `projects.{libName}` di tipo `library`
6. Aggiorna `test-webapp/tsconfig.json` — `"{libName}": ["dist/{libName}"]` in `paths`
7. Crea feature module: `src/app/features/{libName}/` con routing + NgModule wrapper
8. Aggiungi route lazy in `app-routing.module.ts`
9. Aggiungi voce nella sidebar component

## Regole
- `ng-package.json` deve puntare a `src/public-api.ts` come entryFile
- Il path alias NON deve essere duplicato nel tsconfig
- Se lib usa `_tokens.scss`: copiarlo in `projects/{libName}/src/_tokens.scss`
