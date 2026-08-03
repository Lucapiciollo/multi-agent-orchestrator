// redux/dashboard.effects.ts — lib-dashboard
// Unico punto della feature che invoca index.service.ts (regola skill: il
// service è chiamato SOLO da redux/*.effects.ts, mai iniettato nei componenti).
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DashboardService } from '../index.service';
import { DashboardActions } from './dashboard.actions';

@Injectable()
export class DashboardEffects {
  loadClienti$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadClienti),
      switchMap(({ filters }) =>
        this.dashboardService.getClienti(filters).pipe(
          map(({ items, total }) => DashboardActions.loadClientiSuccess({ items, total })),
          catchError((error) => of(DashboardActions.loadClientiFailure({ error: this.toMessage(error) })))
        )
      )
    )
  );

  createCliente$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.createCliente),
      switchMap(({ payload }) =>
        this.dashboardService.createCliente(payload).pipe(
          map((item) => DashboardActions.createClienteSuccess({ item })),
          catchError((error) => of(DashboardActions.createClienteFailure({ error: this.toMessage(error) })))
        )
      )
    )
  );

  updateProfilo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.updateProfilo),
      switchMap(({ payload }) =>
        this.dashboardService.updateProfilo(payload).pipe(
          map(() => DashboardActions.updateProfiloSuccess()),
          catchError((error) => of(DashboardActions.updateProfiloFailure({ error: this.toMessage(error) })))
        )
      )
    )
  );

  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadStats),
      switchMap(() =>
        this.dashboardService.getStats().pipe(
          map((items) => DashboardActions.loadStatsSuccess({ items })),
          catchError((error) => of(DashboardActions.loadStatsFailure({ error: this.toMessage(error) })))
        )
      )
    )
  );

  loadActivities$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadActivities),
      switchMap(() =>
        this.dashboardService.getActivities().pipe(
          map((items) => DashboardActions.loadActivitiesSuccess({ items })),
          catchError((error) => of(DashboardActions.loadActivitiesFailure({ error: this.toMessage(error) })))
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly dashboardService: DashboardService) {}

  private toMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Errore imprevisto nella feature Dashboard';
  }
}
