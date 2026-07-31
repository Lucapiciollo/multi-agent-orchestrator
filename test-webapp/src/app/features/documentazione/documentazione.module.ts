import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../../shared/module/shared.module';
import { DocumentazioneRoutingModule } from './documentazione-routing.module';
import { DocumentazioneComponent } from './documentazione.component';
import { DocumentazioneEffects } from './redux/documentazione.effects';
import { DocumentazioneReducer } from './redux/documentazione.state';

/**
 * Modulo lazy della sezione "Documentazione".
 * Qui si importera' il modulo della libreria generata (lib-documentazione) una volta pronta.
 */
@NgModule({
   declarations: [DocumentazioneComponent],
   imports: [SharedModule, DocumentazioneRoutingModule, StoreModule.forFeature('documentazione', DocumentazioneReducer), EffectsModule.forFeature([DocumentazioneEffects])],
})
export class DocumentazioneModule {}
