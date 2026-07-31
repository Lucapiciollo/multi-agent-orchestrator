import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../../shared/module/shared.module';
import { PeriodoRoutingModule } from './periodo-routing.module';
import { PeriodoComponent } from './periodo.component';
import { PeriodoEffects } from './redux/periodo.effects';
import { PeriodoReducer } from './redux/periodo.state';

/**
 * Modulo lazy della sezione "Periodo".
 * Qui si importera' il modulo della libreria generata (lib-periodo) una volta pronta.
 */
@NgModule({
   declarations: [PeriodoComponent],
   imports: [SharedModule, PeriodoRoutingModule, StoreModule.forFeature('periodo', PeriodoReducer), EffectsModule.forFeature([PeriodoEffects])],
})
export class PeriodoModule {}
