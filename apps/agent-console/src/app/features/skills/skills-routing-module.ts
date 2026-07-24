import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SkillsList } from './skills-list/skills-list';

const routes: Routes = [{ path: '', component: SkillsList }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class SkillsRoutingModule {}
