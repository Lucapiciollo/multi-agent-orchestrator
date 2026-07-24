import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard/dashboard';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [Dashboard],
  imports: [CommonModule, DashboardRoutingModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatListModule, MatChipsModule]
})
export class DashboardModule {}
