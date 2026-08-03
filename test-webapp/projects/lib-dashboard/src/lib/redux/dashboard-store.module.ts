// redux/dashboard-store.module.ts — lib-dashboard
// NgModule esportabile con StoreModule.forFeature + EffectsModule.forFeature.
// Importato da LibDashboardModule (index.module.ts). NON duplicare
// StoreModule.forFeature nel modulo app-side consumer.
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { DashboardEffects } from './dashboard.effects';
import { dashboardReducer } from './dashboard.reducer';
import { featureKey } from './dashboard.state';

@NgModule({
  imports: [
    StoreModule.forFeature(featureKey, dashboardReducer),
    EffectsModule.forFeature([DashboardEffects]),
  ],
})
export class DashboardStoreModule {}
