import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// IndexComponent is the feature's routed entry point (smart/container,
// NgRx-connected). It is generated in the next atomic step (Phase 8b — UI
// components) alongside its .html/.scss; this routing module is wired to it
// now per the mandatory pattern, as committed to in architecture-report.md
// (section "ROUTES FOUND").
import { IndexComponent } from './index.component';
import { ReportGuard } from './index.guard';

/**
 * index-routing.module.ts — "Report" feature (slug: lib-report)
 *
 * The legacy prototype toggles between "Elenco report" and "Storico report"
 * via a pure display:none switch (showReportView, JS-059) with no URL/hash
 * change. Per Gate 2 (AMBIGUITY-C-01, RESOLVED), this is promoted to two
 * guarded child routes rendered by the same IndexComponent entry point:
 *
 *  - ''        → redirect to 'elenco'
 *  - 'elenco'  → IndexComponent (view: elenco), dispatches loadReportCatalog()
 *  - 'storico' → IndexComponent (view: storico), dispatches loadStorico()
 *
 * Both routes are guarded by ReportGuard (canActivate). No dialog/modal is
 * ever declared as a route.
 */
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'elenco',
  },
  {
    path: 'elenco',
    component: IndexComponent,
    canActivate: [ReportGuard],
    data: { view: 'elenco' },
  },
  {
    path: 'storico',
    component: IndexComponent,
    canActivate: [ReportGuard],
    data: { view: 'storico' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule {}
