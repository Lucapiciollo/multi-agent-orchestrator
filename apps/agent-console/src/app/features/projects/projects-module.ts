import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsRoutingModule } from './projects-routing-module';
import { ProjectsList } from './projects-list/projects-list';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ProjectsList],
  imports: [CommonModule, ProjectsRoutingModule, MatTableModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule]
})
export class ProjectsModule {}
