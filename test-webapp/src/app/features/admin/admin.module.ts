import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../../shared/module/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminEffects } from './redux/admin.effects';
import { AdminReducer } from './redux/admin.state';

/**
 * Modulo lazy della sezione "Admin".
 * Qui si importera' il modulo della libreria generata (lib-admin) una volta pronta.
 */
@NgModule({
   declarations: [AdminComponent],
   imports: [SharedModule, AdminRoutingModule, StoreModule.forFeature('admin', AdminReducer), EffectsModule.forFeature([AdminEffects])],
})
export class AdminModule {}
