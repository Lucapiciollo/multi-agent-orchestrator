import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExecutionsList } from './executions-list/executions-list';
import { ExecutionDetail } from './execution-detail/execution-detail';

const routes: Routes = [
  { path: '', component: ExecutionsList },
  { path: ':id', component: ExecutionDetail }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ExecutionsRoutingModule {}
