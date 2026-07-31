import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../../shared/module/shared.module';
import { DownloadRoutingModule } from './download-routing.module';
import { DownloadComponent } from './download.component';
import { DownloadEffects } from './redux/download.effects';
import { DownloadReducer } from './redux/download.state';

/**
 * Modulo lazy della sezione "Download".
 * Qui si importera' il modulo della libreria generata (lib-download) una volta pronta.
 */
@NgModule({
   declarations: [DownloadComponent],
   imports: [SharedModule, DownloadRoutingModule, StoreModule.forFeature('download', DownloadReducer), EffectsModule.forFeature([DownloadEffects])],
})
export class DownloadModule {}
