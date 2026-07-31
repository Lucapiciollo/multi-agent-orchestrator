import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SectionGuard } from '../../core/guards/section.guard';
import { GestionePeriodoComponent } from './gestione-periodo.component';

const routes: Routes = [{ path: '', component: GestionePeriodoComponent, canActivate: [SectionGuard] }];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class GestionePeriodoRoutingModule {}
