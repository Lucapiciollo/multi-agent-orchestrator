import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowsRoutingModule } from './workflows-routing-module';
import { WorkflowsList } from './workflows-list/workflows-list';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [WorkflowsList],
  imports: [CommonModule, WorkflowsRoutingModule, MatTableModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule, MatChipsModule, MatExpansionModule, MatDialogModule, MatSelectModule, MatTooltipModule]
})
export class WorkflowsModule {}
