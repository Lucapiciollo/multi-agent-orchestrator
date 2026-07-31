import { NgModule } from '@angular/core';
import { ReportModule as LibReportModule } from 'lib-report';
import { SharedModule } from '../../shared/module/shared.module';
import { ReportRoutingModule } from './report-routing.module';

/**
 * Modulo lazy della sezione "Report". La UI arriva da 'lib-report' (progetto
 * Angular reale in projects/lib-report, referenziato via tsconfig paths),
 * NON da un componente duplicato dentro src/app/features/report/. Redux e
 * guard restano qui lato app perche' riguardano l'integrazione nella shell.
 *
 * NOTE: StoreModule.forFeature e EffectsModule.forFeature NON vanno aggiunti
 * qui — sono già registrati dentro LibReportModule tramite ReportStoreModule.
 */
@NgModule({
   imports: [
      SharedModule,
      ReportRoutingModule,
      LibReportModule,
   ],
})
export class ReportModule {}
