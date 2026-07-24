import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: 'agents', loadChildren: () => import('./features/agents/agents-module').then(m => m.AgentsModule) }, { path: 'skills', loadChildren: () => import('./features/skills/skills-module').then(m => m.SkillsModule) }, { path: 'workflows', loadChildren: () => import('./features/workflows/workflows-module').then(m => m.WorkflowsModule) }, { path: 'executions', loadChildren: () => import('./features/executions/executions-module').then(m => m.ExecutionsModule) }, { path: 'providers', loadChildren: () => import('./features/providers/providers-module').then(m => m.ProvidersModule) }, { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard-module').then(m => m.DashboardModule) }, { path: 'projects', loadChildren: () => import('./features/projects/projects-module').then(m => m.ProjectsModule) }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
