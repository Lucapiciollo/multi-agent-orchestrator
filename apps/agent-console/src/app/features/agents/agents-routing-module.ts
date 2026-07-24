import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentsList } from './agents-list/agents-list';

const routes: Routes = [{ path: '', component: AgentsList }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class AgentsRoutingModule {}
