import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent as ReportIndexComponent } from 'lib-report';
import { SectionGuard } from '../../core/guards/section.guard';

/**
 * REGOLA: IndexComponent usa ActivatedRoute.data['view'] per distinguere
 * la vista 'elenco' dalla vista 'storico'. Le route figlie DEVONO passare
 * data: { view } affinché il componente riceva il valore corretto.
 */
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'elenco',
  },
  {
    path: 'elenco',
    component: ReportIndexComponent,
    canActivate: [SectionGuard],
    data: { view: 'elenco' },
  },
  {
    path: 'storico',
    component: ReportIndexComponent,
    canActivate: [SectionGuard],
    data: { view: 'storico' },
  },
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class ReportRoutingModule {}
