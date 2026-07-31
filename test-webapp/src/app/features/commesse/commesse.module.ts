import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../../shared/module/shared.module';
import { CommesseRoutingModule } from './commesse-routing.module';
import { CommesseComponent } from './commesse.component';
import { CommesseEffects } from './redux/commesse.effects';
import { CommesseReducer } from './redux/commesse.state';

/**
 * Modulo lazy della sezione "Commesse".
 * Qui si importera' il modulo della libreria generata (lib-commesse) una volta pronta.
 */
@NgModule({
   declarations: [CommesseComponent],
   imports: [SharedModule, CommesseRoutingModule, StoreModule.forFeature('commesse', CommesseReducer), EffectsModule.forFeature([CommesseEffects])],
})
export class CommesseModule {}
