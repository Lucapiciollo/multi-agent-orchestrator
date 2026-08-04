// index.module.ts — lib-dashboard (LibDashboardModule)
//
// ⚠️ NOTA DI CONFORMITÀ (vedi errors/artifacts nel report finale di questo step):
// la skill "Angular Component Extractor" §"REGOLA: la lib NON deve importare
// il suo routing module" e architecture-report.md §ROUTES FOUND stabiliscono
// esplicitamente che LibDashboardModule NON deve importare IndexRoutingModule
// (il routing appartiene all'app consumer). IndexRoutingModule resta quindi
// generato solo a scopo di documentazione delle route suggerite e NON è
// incluso negli imports sottostanti, anche se il testo del task di questo
// step lo cita letteralmente: si è data priorità alla regola architetturale
// vincolante (Gate 2 approvato) rispetto alla formulazione generica del task.
//
// StoreModule.forFeature + EffectsModule.forFeature sono incapsulati in
// DashboardStoreModule (redux/dashboard-store.module.ts) — MAI duplicarli qui
// né nel modulo app-side consumer.
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
// PlDynamicFormModule — usato da ClientiFilterBarComponent (pl-dynamicform),
// vedi architecture-report.md §COMPONENTS PROPOSED riga 6.
import { PlDynamicFormModule } from 'pl-dynamicform';

import { IndexComponent } from './index.component';
import { DashboardGuard } from './index.guard';
import { DashboardService } from './index.service';
import { DashboardStoreModule } from './redux';

// NOTA: i componenti sotto components/ e dialogs/ sono generati nel task
// successivo (Phase 8b — migrazione componenti). Questo array `declarations`
// verrà esteso in quel task con: DashboardHeadingComponent, StatsPanelComponent,
// StatCardComponent, ClientiListCardComponent, ClientiFilterBarComponent,
// ClientiTableComponent, ClientiTableRowComponent, ClientiPaginationComponent,
// ProfiloCommercialeFormComponent, AttivitaRecentiComponent, ActivityItemComponent,
// NuovoClienteDialogComponent (tutti standalone: false, coerenti con questo modulo).
@NgModule({
  declarations: [IndexComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatSnackBarModule,
    PlDynamicFormModule,
    DashboardStoreModule,
  ],
  exports: [IndexComponent],
  providers: [DashboardGuard, DashboardService],
})
export class LibDashboardModule {}
