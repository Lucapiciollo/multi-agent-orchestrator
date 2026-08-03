// index-routing.module.ts — lib-dashboard
//
// ⚠️ NOTA ARCHITETTURALE (skill Angular Component Extractor §"REGOLA: la lib
// NON deve importare il suo routing module" + architecture-report.md
// §ROUTES FOUND): questo modulo NON viene importato da index.module.ts.
// Il routing appartiene all'applicazione consumer, non alla libreria.
// Questo file resta come DOCUMENTAZIONE delle route suggerite: il progetto
// consumer (test-webapp) copierà queste route nel proprio routing module
// applicativo, aggiungendo eventualmente `data.view` se in futuro la Dashboard
// dovesse esporre più viste (non necessario oggi: vista unica, vedi
// architecture-report.md §FLOW/§PAGES FOUND).
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index.component';
import { DashboardGuard } from './index.guard';

// Route suggerita per il consumer (es. montata su `/dashboard`):
// { path: '', component: IndexComponent, canActivate: [DashboardGuard] }
export const dashboardRoutes: Routes = [
  {
    path: '',
    component: IndexComponent,
    canActivate: [DashboardGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(dashboardRoutes)],
  exports: [RouterModule],
})
export class IndexRoutingModule {}
