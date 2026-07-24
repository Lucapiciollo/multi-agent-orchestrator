import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { __FEATURE_PASCAL__Actions } from './__FEATURE__.actions';
import { __FEATURE_PASCAL__Service } from '../services/__FEATURE__.service';

@Injectable()
export class __FEATURE_PASCAL__Effects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(__FEATURE_PASCAL__Actions.load),
      switchMap(() =>
        this.service.load().pipe(
          map((items) => __FEATURE_PASCAL__Actions.loadSuccess({ items })),
          catchError((error) => of(__FEATURE_PASCAL__Actions.loadFailure({ error: String(error) })))
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly service: __FEATURE_PASCAL__Service
  ) {}
}
