import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentsRoutingModule } from './agents-routing-module';
import { AgentsList } from './agents-list/agents-list';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [AgentsList],
  imports: [CommonModule, AgentsRoutingModule, MatTableModule, MatCardModule, MatChipsModule, MatIconModule, MatProgressSpinnerModule, MatBadgeModule, MatTooltipModule, MatButtonModule]
})
export class AgentsModule {}
