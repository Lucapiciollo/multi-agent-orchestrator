import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SectionGuard } from '../../core/guards/section.guard';
import { FeriePermessiComponent } from './ferie-permessi.component';

const routes: Routes = [{ path: '', component: FeriePermessiComponent, canActivate: [SectionGuard] }];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class FeriePermessiRoutingModule {}
