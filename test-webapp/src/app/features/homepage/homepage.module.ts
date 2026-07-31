import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../../shared/module/shared.module';
import { HomepageRoutingModule } from './homepage-routing.module';
import { HomepageComponent } from './homepage.component';
import { HomepageEffects } from './redux/homepage.effects';
import { HomepageReducer } from './redux/homepage.state';

/**
 * Modulo lazy della sezione "Homepage".
 * Qui si importera' il modulo della libreria generata (lib-homepage) una volta pronta.
 */
@NgModule({
   declarations: [HomepageComponent],
   imports: [SharedModule, HomepageRoutingModule, StoreModule.forFeature('homepage', HomepageReducer), EffectsModule.forFeature([HomepageEffects])],
})
export class HomepageModule {}
