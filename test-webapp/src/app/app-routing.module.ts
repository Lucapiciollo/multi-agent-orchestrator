import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

/**
 * Routing radice: tutta la web app vive sotto la shell LayoutComponent
 * (sidebar + topbar). Ogni voce del menu (vedi shared/component/sidebar/menu-items.ts)
 * e' una route figlia lazy-loaded verso il proprio feature module — lo stesso
 * path in cui verra' montata la libreria generata dal workflow (es. lib-report
 * dentro features/report).
 */
const routes: Routes = [
   {
      path: '',
      component: LayoutComponent,
      children: [
         { path: '', pathMatch: 'full', redirectTo: 'homepage' },
         { path: 'homepage', loadChildren: () => import('./features/homepage/homepage.module').then((m) => m.HomepageModule) },
         { path: 'periodo', loadChildren: () => import('./features/periodo/periodo.module').then((m) => m.PeriodoModule) },
         {
            path: 'gestione-periodo',
            loadChildren: () => import('./features/gestione-periodo/gestione-periodo.module').then((m) => m.GestionePeriodoModule),
         },
         { path: 'commesse', loadChildren: () => import('./features/commesse/commesse.module').then((m) => m.CommesseModule) },
         {
            path: 'ferie-permessi',
            loadChildren: () => import('./features/ferie-permessi/ferie-permessi.module').then((m) => m.FeriePermessiModule),
         },
         { path: 'deleghe', loadChildren: () => import('./features/deleghe/deleghe.module').then((m) => m.DelegheModule) },
         { path: 'admin', loadChildren: () => import('./features/admin/admin.module').then((m) => m.AdminModule) },
         {
            path: 'configurazioni',
            loadChildren: () => import('./features/configurazioni/configurazioni.module').then((m) => m.ConfigurazioniModule),
         },
         { path: 'report', loadChildren: () => import('./features/report/report.module').then((m) => m.ReportModule) },
         { path: 'download', loadChildren: () => import('./features/download/download.module').then((m) => m.DownloadModule) },
         {
            path: 'documentazione',
            loadChildren: () => import('./features/documentazione/documentazione.module').then((m) => m.DocumentazioneModule),
         },
         { path: '**', redirectTo: 'homepage' },
      ],
   },
];

@NgModule({
   imports: [RouterModule.forRoot(routes)],
   exports: [RouterModule],
})
export class AppRoutingModule {}
