// index.component.ts — lib-dashboard
// IndexComponent — entry point / container della feature Dashboard.
// Regola vincolante (validazione step-09): legge lo stato SOLO tramite
// store.select(...) (selector NgRx) e scrive SOLO tramite store.dispatch(...)
// di action — mai accesso diretto a servizi di dominio (DashboardService è
// iniettato unicamente in redux/dashboard.effects.ts, mai qui).
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { NuovoClienteDialogComponent } from './dialogs/nuovo-cliente/nuovo-cliente-dialog.component';
import { ClientiFilters, NuovoClientePayload, ProfiloCommercialePayload } from './index.models';
import {
  DashboardActions,
  selectActivities,
  selectClienti,
  selectError,
  selectFilters,
  selectLoading,
  selectPage,
  selectStats,
  selectTotalCount,
} from './redux';

@Component({
  standalone: false,
  selector: 'lib-dashboard',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndexComponent implements OnInit, OnDestroy {
  // NOTA: si usa inject() (anziché parametri di costruttore) perché con
  // useDefineForClassFields (target ES2022+) gli initializer dei campi
  // classe girano PRIMA dell'assegnazione delle constructor parameter
  // properties, causando "used before its initialization" sui selector
  // sottostanti. inject() risolve la dipendenza al momento della
  // dichiarazione del campo, rispettando l'ordine dichiarativo.
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private readonly destroy$ = new Subject<void>();

  // Letture di stato ESCLUSIVAMENTE tramite store.select(...) (redux/dashboard.selectors.ts).
  readonly clienti$ = this.store.select(selectClienti);
  readonly totalCount$ = this.store.select(selectTotalCount);
  readonly page$ = this.store.select(selectPage);
  readonly filters$ = this.store.select(selectFilters);
  readonly stats$ = this.store.select(selectStats);
  readonly activities$ = this.store.select(selectActivities);
  readonly loading$ = this.store.select(selectLoading);
  readonly error$ = this.store.select(selectError);

  ngOnInit(): void {
    // S4 (ingresso vista Dashboard): dispatch iniziale, vedi architecture-report.md §FLOW punto 1.
    this.store.dispatch(DashboardActions.loadClienti({}));
    this.store.dispatch(DashboardActions.loadStats());
    this.store.dispatch(DashboardActions.loadActivities());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // T-? (nessun handler nel sorgente per "Esporta CSV"): placeholder di
  // estensione, nessuna action NgRx definita in questo Gate — TODO Phase 8+.
  onExportCsv(): void {
    // Intenzionalmente no-op: nessuna azione/effect previsti dal report architetturale.
  }

  // JS-006: apertura MatDialog "Nuovo cliente" da DashboardHeadingComponent.
  onOpenNuovoCliente(): void {
    const dialogRef = this.dialog.open(NuovoClienteDialogComponent, {
      width: '620px',
      maxWidth: '95vw',
      maxHeight: 'calc(100vh - 48px)',
      panelClass: 'lib-dashboard-nuovo-cliente-panel',
      backdropClass: 'dashboard-nuovo-cliente-backdrop',
      // Sostituisce JS-005c (focus su #firstFocus dopo 50ms): il campo Nome
      // è il primo elemento tabbable del form del dialog.
      autoFocus: 'first-tabbable',
      restoreFocus: true,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((payload: NuovoClientePayload | undefined) => {
        if (payload) {
          this.store.dispatch(DashboardActions.createCliente({ payload }));
        }
      });
  }

  // T8 (nessun handler nel sorgente): refresh via redispatch di loadClienti().
  onRefreshClienti(): void {
    this.store.dispatch(DashboardActions.loadClienti({}));
  }

  // T9 (nessun handler nel sorgente): filtro via loadClienti({filters}).
  onFilterClienti(filters: ClientiFilters): void {
    this.store.dispatch(DashboardActions.loadClienti({ filters }));
  }

  onResetFiltri(): void {
    this.store.dispatch(DashboardActions.loadClienti({ filters: {} }));
  }

  // T11 (nessun handler nel sorgente): paginazione via setPage(n).
  onPageChange(page: number): void {
    this.store.dispatch(DashboardActions.setPage({ page }));
  }

  // JS-011: submit form "Profilo commerciale", in sostituzione di
  // alert('Demo: profilo salvato').
  onSaveProfilo(payload: ProfiloCommercialePayload): void {
    this.store.dispatch(DashboardActions.updateProfilo({ payload }));
    this.snackBar.open('Profilo commerciale salvato', 'Chiudi', { duration: 3000 });
  }

  // T13 (nessun handler nel sorgente): bottone "+" attività, placeholder di estensione.
  onAddActivity(): void {
    // Intenzionalmente no-op: nessuna azione/effect previsti dal report architetturale.
  }
}
