import { NgModule } from '@angular/core';
import { LibDashboardModule } from 'lib-dashboard';
import { SharedModule } from '../../shared/module/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';

@NgModule({
  imports: [
    SharedModule,
    DashboardRoutingModule,
    LibDashboardModule,
  ],
})
export class DashboardModule {}
