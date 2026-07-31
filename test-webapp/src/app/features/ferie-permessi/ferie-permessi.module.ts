import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../../shared/module/shared.module';
import { FeriePermessiRoutingModule } from './ferie-permessi-routing.module';
import { FeriePermessiComponent } from './ferie-permessi.component';
import { FeriePermessiEffects } from './redux/ferie-permessi.effects';
import { FeriePermessiReducer } from './redux/ferie-permessi.state';

/**
 * Modulo lazy della sezione "Ferie e Permessi".
 * Qui si importera' il modulo della libreria generata (lib-ferie-permessi) una volta pronta.
 */
@NgModule({
   declarations: [FeriePermessiComponent],
   imports: [SharedModule, FeriePermessiRoutingModule, StoreModule.forFeature('ferie-permessi', FeriePermessiReducer), EffectsModule.forFeature([FeriePermessiEffects])],
})
export class FeriePermessiModule {}
