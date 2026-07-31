import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

import { ReportWizardDialogComponent } from './dialogs/report-wizard-dialog/report-wizard-dialog.component';
import { ConfirmDeleteDialogComponent } from './dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { StoricoDetailDialogComponent } from './dialogs/storico-detail-dialog/storico-detail-dialog.component';

import {
  ReportActions,
  selectCategories,
  selectCategoriesError,
  selectCategoriesLoading,
  selectFilteredStoricoPage,
  selectMyReports,
  selectStoricoError,
  selectStoricoFilters,
  selectStoricoLoading,
  selectStoricoPageIndex,
  selectStoricoPageSize,
  selectStoricoTotal,
} from './redux';

import {
  ReportCategory,
  ReportWizardDialogMode,
  SavedReport,
  StoricoFilters,
  StoricoRecord,
} from './index.models';

type ReportView = 'elenco' | 'storico';

/**
 * index.component.ts — "Report" feature entry point (slug: lib-report)
 *
 * Smart/container component, activated by the router (canActivate:
 * [ReportGuard], see index-routing.module.ts). Reads feature state
 * EXCLUSIVELY via store.select(...) (redux/report.selectors.ts) and writes
 * EXCLUSIVELY via store.dispatch(ReportActions...) — never mutates a local
 * copy of feature data. Opens the 3 MatDialog components identified in
 * dialogs-inventory.md (D1/D2/D3), dispatching store actions from
 * afterClosed() where the dialog itself does not already own that dispatch
 * (see architecture-report.md, "COMPONENTS PROPOSED" #1 and "DIALOGS
 * PROPOSED").
 */
@Component({
  selector: 'lib-report-index',
  standalone: false,
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class IndexComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly view$: Observable<ReportView> = this.route.data.pipe(
    map((data) => (data['view'] as ReportView) ?? 'elenco')
  );

  // --- Elenco view (read-only selectors) ---
  readonly categories$: Observable<ReportCategory[]> = this.store.select(selectCategories);
  readonly categoriesLoading$: Observable<boolean> = this.store.select(selectCategoriesLoading);
  readonly categoriesError$: Observable<string | null> = this.store.select(selectCategoriesError);
  readonly myReportsBySubId$: Observable<Record<string, SavedReport[]>> = this.store.select(selectMyReports);

  // --- Storico view (read-only selectors) ---
  readonly storicoPage$: Observable<StoricoRecord[]> = this.store.select(selectFilteredStoricoPage);
  readonly storicoTotal$: Observable<number> = this.store.select(selectStoricoTotal);
  readonly storicoFilters$: Observable<StoricoFilters> = this.store.select(selectStoricoFilters);
  readonly storicoPageIndex$: Observable<number> = this.store.select(selectStoricoPageIndex);
  readonly storicoPageSize$: Observable<number> = this.store.select(selectStoricoPageSize);
  readonly storicoLoading$: Observable<boolean> = this.store.select(selectStoricoLoading);
  readonly storicoError$: Observable<string | null> = this.store.select(selectStoricoError);

  constructor(
    private readonly store: Store,
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.store.dispatch(ReportActions.loadReportCatalog());
    this.store.dispatch(ReportActions.loadCascadingData());
    this.store.dispatch(ReportActions.loadMyReports());

    // Storico items are only fetched when the 'storico' child route is
    // activated (per architecture-report.md, "ROUTES FOUND").
    this.view$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((view) => {
        if (view === 'storico') {
          this.store.dispatch(ReportActions.loadStorico());
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Elenco view handlers (dialog opening + dispatch only) ---

  onOpenPreset(event: { subId: string; presetLabel: string }): void {
    this.openWizard({ subId: event.subId, mode: 'preset', presetLabel: event.presetLabel });
  }

  onOpenCustom(event: { subId: string }): void {
    this.openWizard({ subId: event.subId, mode: 'custom' });
  }

  onOpenSavedReport(event: { subId: string; index: number }): void {
    this.openWizard({ subId: event.subId, mode: 'saved', savedReportIndex: event.index });
  }

  onDeleteSavedReport(event: { subId: string; index: number }): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '420px',
      data: { subId: event.subId, index: event.index },
    });
    ref.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed) {
        this.store.dispatch(
          ReportActions.deleteMyReport({ subId: event.subId, index: event.index })
        );
      }
    });
  }

  private openWizard(data: {
    subId: string;
    mode: ReportWizardDialogMode;
    presetLabel?: string;
    savedReportIndex?: number;
  }): void {
    this.dialog.open(ReportWizardDialogComponent, {
      width: '860px',
      maxWidth: '95vw',
      maxHeight: 'calc(100vh - 48px)',
      panelClass: 'wizard-panel',
      backdropClass: 'wizard-overlay',
      data,
    });
  }

  // --- Storico view handlers (dialog opening + dispatch only) ---

  onStoricoRowClick(row: StoricoRecord): void {
    this.dialog.open(StoricoDetailDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      maxHeight: 'calc(100vh - 48px)',
      panelClass: 'storico-detail-panel',
      data: { id: row.id },
    });
  }

  onStoricoDownload(id: string): void {
    this.store.dispatch(ReportActions.downloadStorico({ id }));
  }

  onStoricoFiltersChange(filters: Partial<StoricoFilters>): void {
    this.store.dispatch(ReportActions.setStoricoFilters({ filters }));
  }

  onStoricoFiltersReset(): void {
    this.store.dispatch(ReportActions.resetStoricoFilters());
  }

  onStoricoPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.store.dispatch(ReportActions.setStoricoPage({ pageIndex: event.pageIndex }));
    this.store.dispatch(ReportActions.setStoricoPageSize({ pageSize: event.pageSize }));
  }
}
