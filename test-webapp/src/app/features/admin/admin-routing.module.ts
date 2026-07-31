import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SectionGuard } from '../../core/guards/section.guard';
import { AdminComponent } from './admin.component';

const routes: Routes = [{ path: '', component: AdminComponent, canActivate: [SectionGuard] }];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class AdminRoutingModule {}
