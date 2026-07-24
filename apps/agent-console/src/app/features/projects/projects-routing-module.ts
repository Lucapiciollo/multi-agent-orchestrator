import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectsList } from './projects-list/projects-list';

const routes: Routes = [{ path: '', component: ProjectsList }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ProjectsRoutingModule {}
