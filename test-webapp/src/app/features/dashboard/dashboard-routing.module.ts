import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent as DashboardIndexComponent } from 'lib-dashboard';
import { SectionGuard } from '../../core/guards/section.guard';

const routes: Routes = [
  { path: '', component: DashboardIndexComponent, canActivate: [SectionGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
