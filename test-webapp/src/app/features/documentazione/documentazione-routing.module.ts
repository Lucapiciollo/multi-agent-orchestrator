import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SectionGuard } from '../../core/guards/section.guard';
import { DocumentazioneComponent } from './documentazione.component';

const routes: Routes = [{ path: '', component: DocumentazioneComponent, canActivate: [SectionGuard] }];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class DocumentazioneRoutingModule {}
