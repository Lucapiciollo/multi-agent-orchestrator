import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillsRoutingModule } from './skills-routing-module';
import { SkillsList } from './skills-list/skills-list';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [SkillsList],
  imports: [CommonModule, SkillsRoutingModule, MatTableModule, MatCardModule, MatChipsModule, MatIconModule, MatProgressSpinnerModule, MatExpansionModule, MatButtonModule]
})
export class SkillsModule {}
