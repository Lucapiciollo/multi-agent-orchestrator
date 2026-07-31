import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SectionGuard } from '../../core/guards/section.guard';
import { DelegheComponent } from './deleghe.component';

const routes: Routes = [{ path: '', component: DelegheComponent, canActivate: [SectionGuard] }];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class DelegheRoutingModule {}
