import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../../shared/module/shared.module';
import { DelegheRoutingModule } from './deleghe-routing.module';
import { DelegheComponent } from './deleghe.component';
import { DelegheEffects } from './redux/deleghe.effects';
import { DelegheReducer } from './redux/deleghe.state';

/**
 * Modulo lazy della sezione "Deleghe".
 * Qui si importera' il modulo della libreria generata (lib-deleghe) una volta pronta.
 */
@NgModule({
   declarations: [DelegheComponent],
   imports: [SharedModule, DelegheRoutingModule, StoreModule.forFeature('deleghe', DelegheReducer), EffectsModule.forFeature([DelegheEffects])],
})
export class DelegheModule {}
