import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { REPORT_FEATURE_KEY } from './report.state';
import { reportReducer } from './report.reducer';
import { ReportEffects } from './report.effects';
import { ReportService } from 'lib-report';

/**
 * report-store.module.ts — registers the "Report" feature store.
 *
 * Uses StoreModule.forFeature / EffectsModule.forFeature — NEVER forRoot
 * inside a feature. Imported by index.module.ts.
 */
@NgModule({
  imports: [
    StoreModule.forFeature(REPORT_FEATURE_KEY, reportReducer),
    EffectsModule.forFeature([ReportEffects]),
  ],
  providers: [ReportService],
})
export class ReportStoreModule {}
