import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProvidersRoutingModule } from './providers-routing-module';
import { ProvidersList } from './providers-list/providers-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [ProvidersList],
  imports: [CommonModule, ProvidersRoutingModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule, MatChipsModule]
})
export class ProvidersModule {}
