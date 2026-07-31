import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SectionGuard } from '../../core/guards/section.guard';
import { DownloadComponent } from './download.component';

const routes: Routes = [{ path: '', component: DownloadComponent, canActivate: [SectionGuard] }];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class DownloadRoutingModule {}
