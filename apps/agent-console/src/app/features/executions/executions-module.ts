import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [ExecutionsList, ExecutionDetail],
  imports: [
    CommonModule, FormsModule, ScrollingModule, ExecutionsRoutingModule,
    MatTableModule, MatCardModule, MatIconModule, MatProgressSpinnerModule,
    MatButtonModule, MatChipsModule, MatListModule, MatDividerModule,
    MatFormFieldModule, MatSelectModule, MatInputModule
  ]
})
export class ExecutionsModule {}
