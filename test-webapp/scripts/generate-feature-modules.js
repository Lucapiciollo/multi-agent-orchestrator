// Script di scaffolding: genera un feature module completo (component + module
// + routing + redux state/effects) per ciascuna voce di menu. Va eseguito una
// tantum con `node scripts/generate-feature-modules.js` dalla root di test-webapp.
const fs = require('fs');
const path = require('path');

const FEATURES = [
   { slug: 'homepage', className: 'Homepage', label: 'Homepage' },
   { slug: 'periodo', className: 'Periodo', label: 'Periodo' },
   { slug: 'gestione-periodo', className: 'GestionePeriodo', label: 'Gestione Periodo' },
   { slug: 'commesse', className: 'Commesse', label: 'Commesse' },
   { slug: 'ferie-permessi', className: 'FeriePermessi', label: 'Ferie e Permessi' },
   { slug: 'deleghe', className: 'Deleghe', label: 'Deleghe' },
   { slug: 'admin', className: 'Admin', label: 'Admin' },
   { slug: 'configurazioni', className: 'Configurazioni', label: 'Configurazioni' },
   { slug: 'report', className: 'Report', label: 'Report' },
   { slug: 'download', className: 'Download', label: 'Download' },
   { slug: 'documentazione', className: 'Documentazione', label: 'Documentazione' },
];

const appRoot = path.join(__dirname, '..', 'src', 'app', 'features');

function write(filePath, content) {
   fs.mkdirSync(path.dirname(filePath), { recursive: true });
   fs.writeFileSync(filePath, content, 'utf8');
   console.log('CREATE', path.relative(process.cwd(), filePath));
}

for (const f of FEATURES) {
   const dir = path.join(appRoot, f.slug);
   const cn = f.className;
   const stateVar = f.slug.replace(/-/g, '_');

   write(
      path.join(dir, 'redux', `${f.slug}.state.ts`),
      `import { createFeatureState } from '../../../redux/feature-state.factory';\n\n` +
         `/**\n * Stato NgRx della sezione "${f.label}". Sostituire \`unknown\` con il DTO reale\n` +
         ` * quando la libreria lib-${f.slug} generata dal workflow espone i suoi modelli.\n */\n` +
         `export const ${stateVar}State = createFeatureState<unknown>('${f.slug}');\n` +
         `export const { load, loadSuccess, loadFailure, reset } = ${stateVar}State.actions;\n` +
         `export const ${cn}Reducer = ${stateVar}State.reducer;\n` +
         `export const { selectStatus, selectData, selectError, selectIsLoading } = ${stateVar}State.selectors;\n`
   );

   write(
      path.join(dir, 'redux', `${f.slug}.effects.ts`),
      `import { Injectable } from '@angular/core';\n` +
         `import { Actions, createEffect, ofType } from '@ngrx/effects';\n` +
         `import { of } from 'rxjs';\n` +
         `import { catchError, map, switchMap } from 'rxjs/operators';\n` +
         `import { load, loadFailure, loadSuccess } from './${f.slug}.state';\n\n` +
         `/**\n * Effect della sezione "${f.label}" (pattern EffectTemplate).\n` +
         ` * Oggi restituisce dati vuoti: quando la lib-${f.slug} generata dallo skill\n` +
         ` * espone un servizio reale, va iniettato qui al posto del placeholder.\n */\n` +
         `@Injectable()\n` +
         `export class ${cn}Effects {\n` +
         `   load$ = createEffect(() =>\n` +
         `      this.actions$.pipe(\n` +
         `         ofType(load),\n` +
         `         switchMap(() =>\n` +
         `            of(null).pipe(\n` +
         `               map((data) => loadSuccess({ data })),\n` +
         `               catchError((error) => of(loadFailure({ error: error?.message ?? 'Errore sconosciuto' })))\n` +
         `            )\n` +
         `         )\n` +
         `      )\n` +
         `   );\n\n` +
         `   constructor(private actions$: Actions) {}\n` +
         `}\n`
   );

   write(
      path.join(dir, `${f.slug}.component.ts`),
      `import { Component, OnInit } from '@angular/core';\n` +
         `import { Store } from '@ngrx/store';\n` +
         `import { load, selectData, selectIsLoading } from './redux/${f.slug}.state';\n\n` +
         `/**\n * Punto di innesto per la libreria generata lib-${f.slug}.\n` +
         ` * Quando la lib e' pronta, importarne il modulo in ${cn}Module e sostituire\n` +
         ` * il template sotto con il selector del componente d'ingresso della lib (\`index\`).\n */\n` +
         `@Component({\n` +
         `   selector: 'app-${f.slug}',\n` +
         `   templateUrl: './${f.slug}.component.html',\n` +
         `   styleUrls: ['./${f.slug}.component.scss'],\n` +
         `})\n` +
         `export class ${cn}Component implements OnInit {\n` +
         `   readonly isLoading$ = this.store.select(selectIsLoading);\n` +
         `   readonly data$ = this.store.select(selectData);\n\n` +
         `   constructor(private store: Store) {}\n\n` +
         `   ngOnInit(): void {\n` +
         `      this.store.dispatch(load());\n` +
         `   }\n` +
         `}\n`
   );

   write(
      path.join(dir, `${f.slug}.component.html`),
      `<div class="feature-placeholder">\n` +
         `   <h2>${f.label}</h2>\n` +
         `   <p *ngIf="isLoading$ | async">Caricamento…</p>\n` +
         `   <p *ngIf="!(isLoading$ | async)">\n` +
         `      Sezione "${f.label}" pronta ad ospitare <code>lib-${f.slug}</code>.\n` +
         `      Importa il modulo della libreria generata in <code>${f.slug}.module.ts</code>\n` +
         `      e sostituisci questo placeholder con <code>&lt;lib-${f.slug}&gt;&lt;/lib-${f.slug}&gt;</code>.\n` +
         `   </p>\n` +
         `</div>\n`
   );

   write(path.join(dir, `${f.slug}.component.scss`), `.feature-placeholder {\n   padding: 8px;\n}\n`);

   write(
      path.join(dir, `${f.slug}-routing.module.ts`),
      `import { NgModule } from '@angular/core';\n` +
         `import { RouterModule, Routes } from '@angular/router';\n` +
         `import { SectionGuard } from '../../core/guards/section.guard';\n` +
         `import { ${cn}Component } from './${f.slug}.component';\n\n` +
         `const routes: Routes = [{ path: '', component: ${cn}Component, canActivate: [SectionGuard] }];\n\n` +
         `@NgModule({\n   imports: [RouterModule.forChild(routes)],\n   exports: [RouterModule],\n})\n` +
         `export class ${cn}RoutingModule {}\n`
   );

   write(
      path.join(dir, `${f.slug}.module.ts`),
      `import { NgModule } from '@angular/core';\n` +
         `import { EffectsModule } from '@ngrx/effects';\n` +
         `import { StoreModule } from '@ngrx/store';\n` +
         `import { SharedModule } from '../../shared/module/shared.module';\n` +
         `import { ${cn}RoutingModule } from './${f.slug}-routing.module';\n` +
         `import { ${cn}Component } from './${f.slug}.component';\n` +
         `import { ${cn}Effects } from './redux/${f.slug}.effects';\n` +
         `import { ${cn}Reducer } from './redux/${f.slug}.state';\n\n` +
         `/**\n * Modulo lazy della sezione "${f.label}".\n` +
         ` * Qui si importera' il modulo della libreria generata (lib-${f.slug}) una volta pronta.\n */\n` +
         `@NgModule({\n` +
         `   declarations: [${cn}Component],\n` +
         `   imports: [SharedModule, ${cn}RoutingModule, StoreModule.forFeature('${f.slug}', ${cn}Reducer), EffectsModule.forFeature([${cn}Effects])],\n` +
         `})\n` +
         `export class ${cn}Module {}\n`
   );
}

console.log(`\nGenerati ${FEATURES.length} feature module in src/app/features/`);
