import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../../shared/module/shared.module';
import { GestionePeriodoRoutingModule } from './gestione-periodo-routing.module';
import { GestionePeriodoComponent } from './gestione-periodo.component';
import { GestionePeriodoEffects } from './redux/gestione-periodo.effects';
import { GestionePeriodoReducer } from './redux/gestione-periodo.state';

/**
 * Modulo lazy della sezione "Gestione Periodo".
 * Qui si importera' il modulo della libreria generata (lib-gestione-periodo) una volta pronta.
 */
@NgModule({
   declarations: [GestionePeriodoComponent],
   imports: [SharedModule, GestionePeriodoRoutingModule, StoreModule.forFeature('gestione-periodo', GestionePeriodoReducer), EffectsModule.forFeature([GestionePeriodoEffects])],
})
export class GestionePeriodoModule {}
