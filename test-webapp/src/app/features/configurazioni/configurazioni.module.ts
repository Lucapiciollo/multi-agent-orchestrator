import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../../shared/module/shared.module';
import { ConfigurazioniRoutingModule } from './configurazioni-routing.module';
import { ConfigurazioniComponent } from './configurazioni.component';
import { ConfigurazioniEffects } from './redux/configurazioni.effects';
import { ConfigurazioniReducer } from './redux/configurazioni.state';

/**
 * Modulo lazy della sezione "Configurazioni".
 * Qui si importera' il modulo della libreria generata (lib-configurazioni) una volta pronta.
 */
@NgModule({
   declarations: [ConfigurazioniComponent],
   imports: [SharedModule, ConfigurazioniRoutingModule, StoreModule.forFeature('configurazioni', ConfigurazioniReducer), EffectsModule.forFeature([ConfigurazioniEffects])],
})
export class ConfigurazioniModule {}
