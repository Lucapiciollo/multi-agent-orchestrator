import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SectionGuard } from '../../core/guards/section.guard';
import { ConfigurazioniComponent } from './configurazioni.component';

const routes: Routes = [{ path: '', component: ConfigurazioniComponent, canActivate: [SectionGuard] }];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class ConfigurazioniRoutingModule {}
