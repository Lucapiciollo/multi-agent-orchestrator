import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard/dashboard';
import { MatCardModule }           from '@angular/material/card';
import { MatIconModule }           from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule }           from '@angular/material/list';
import { MatChipsModule }          from '@angular/material/chips';
import { MatButtonModule }         from '@angular/material/button';
import { MatTooltipModule }        from '@angular/material/tooltip';

@NgModule({
  declarations: [Dashboard],
  imports: [
    CommonModule, RouterModule, DashboardRoutingModule,
    MatCardModule, MatIconModule, MatProgressSpinnerModule,
    MatListModule, MatChipsModule, MatButtonModule, MatTooltipModule
  ]
})
export class DashboardModule {}
