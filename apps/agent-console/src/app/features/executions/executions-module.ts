import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExecutionsRoutingModule } from './executions-routing-module';
import { ExecutionsList } from './executions-list/executions-list';
import { ExecutionDetail } from './execution-detail/execution-detail';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [ExecutionsList, ExecutionDetail],
  imports: [CommonModule, ExecutionsRoutingModule, MatTableModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule, MatChipsModule, MatListModule, MatDividerModule]
})
export class ExecutionsModule {}
