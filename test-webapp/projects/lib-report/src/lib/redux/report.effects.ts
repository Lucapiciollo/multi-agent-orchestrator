import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';

import { ReportService } from '../index.service';
import { ReportActions } from './report.actions';

/**
 * report.effects.ts — "Report" feature (lib-report)
 *
 * This is the ONLY place allowed to call index.service.ts. Never call
 * ReportService (or HttpClient) directly from a component.
 */
@Injectable()
export class ReportEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly reportService: ReportService,
    private readonly snackBar: MatSnackBar
  ) {}

  loadReportCatalog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.loadReportCatalog),
      switchMap(() =>
        this.reportService.getReportCatalog().pipe(
          map((categories) =>
            ReportActions.loadReportCatalogSuccess({ categories })
          ),
          catchError((error) =>
            of(
              ReportActions.loadReportCatalogFailure({
                error: error?.message ?? 'Errore nel caricamento del catalogo report',
              })
            )
          )
        )
      )
    )
  );

  loadCascadingData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.loadCascadingData),
      switchMap(() =>
        this.reportService.getCascadingData().pipe(
          map((cascadingData) =>
            ReportActions.loadCascadingDataSuccess({ cascadingData })
          ),
          catchError((error) =>
            of(
              ReportActions.loadCascadingDataFailure({
                error: error?.message ?? 'Errore nel caricamento dei filtri a cascata',
              })
            )
          )
        )
      )
    )
  );

  loadMyReports$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.loadMyReports),
      switchMap(() =>
        this.reportService.getMyReports().pipe(
          map((myReports) => ReportActions.loadMyReportsSuccess({ myReports })),
          catchError((error) =>
            of(
              ReportActions.loadMyReportsFailure({
                error: error?.message ?? 'Errore nel caricamento dei report salvati',
              })
            )
          )
        )
      )
    )
  );

  saveMyReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.saveMyReport),
      mergeMap(({ subId, payload }) =>
        this.reportService.saveMyReport(subId, payload).pipe(
          map((report) => ReportActions.saveMyReportSuccess({ subId, report })),
          catchError((error) =>
            of(
              ReportActions.saveMyReportFailure({
                error: error?.message ?? 'Errore nel salvataggio del report',
              })
            )
          )
        )
      )
    )
  );

  updateMyReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.updateMyReport),
      mergeMap(({ subId, index, payload }) =>
        this.reportService.updateMyReport(subId, index, payload).pipe(
          map((report) =>
            ReportActions.updateMyReportSuccess({ subId, index, report })
          ),
          catchError((error) =>
            of(
              ReportActions.updateMyReportFailure({
                error: error?.message ?? "Errore nell'aggiornamento del report",
              })
            )
          )
        )
      )
    )
  );

  deleteMyReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.deleteMyReport),
      mergeMap(({ subId, index }) =>
        this.reportService.deleteMyReport(subId, index).pipe(
          map(() => ReportActions.deleteMyReportSuccess({ subId, index })),
          catchError((error) =>
            of(
              ReportActions.deleteMyReportFailure({
                error: error?.message ?? "Errore nell'eliminazione del report",
              })
            )
          )
        )
      )
    )
  );

  loadStorico$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.loadStorico),
      switchMap(() =>
        this.reportService.getStorico().pipe(
          map((items) => ReportActions.loadStoricoSuccess({ items })),
          catchError((error) =>
            of(
              ReportActions.loadStoricoFailure({
                error: error?.message ?? "Errore nel caricamento dello storico",
              })
            )
          )
        )
      )
    )
  );

  requestExport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.requestExport),
      mergeMap(({ subId, format, filters, columns }) =>
        this.reportService
          .requestReportExport(subId, format, filters, columns)
          .pipe(
            map((record) => ReportActions.requestExportSuccess({ record })),
            catchError((error) =>
              of(
                ReportActions.requestExportFailure({
                  error: error?.message ?? "Errore nella richiesta di export",
                })
              )
            )
          )
      )
    )
  );

  requestExportSuccessToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ReportActions.requestExportSuccess),
        tap(() => {
          this.snackBar.open('Richiesta di download inviata', 'Chiudi', {
            duration: 3000,
          });
        })
      ),
    { dispatch: false }
  );

  downloadStorico$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.downloadStorico),
      mergeMap(({ id }) =>
        this.reportService.downloadStoricoFile(id).pipe(
          map((record) => ReportActions.downloadStoricoSuccess({ record })),
          catchError((error) =>
            of(
              ReportActions.downloadStoricoFailure({
                error: error?.message ?? "Errore nel download del file",
              })
            )
          )
        )
      )
    )
  );

  downloadStoricoSuccessToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ReportActions.downloadStoricoSuccess),
        tap(() => {
          this.snackBar.open('Download avviato', 'Chiudi', { duration: 3000 });
        })
      ),
    { dispatch: false }
  );
}
