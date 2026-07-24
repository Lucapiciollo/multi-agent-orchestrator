import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkflowsList } from './workflows-list/workflows-list';

const routes: Routes = [{ path: '', component: WorkflowsList }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class WorkflowsRoutingModule {}
