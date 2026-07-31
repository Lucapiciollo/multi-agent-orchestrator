import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

/**
 * Template Effect generico — ricalca redux/template/EffectTemplate.ts di TimeVision.
 * Ogni feature copia questo pattern (vedi features/report/redux/report.effects.ts)
 * sostituendo `load`/`loadSuccess`/`loadFailure` con le action della propria
 * createFeatureState() e il servizio di chiamata reale al posto del placeholder.
 */
@Injectable()
export class EffectTemplate {
   constructor(private actions$: Actions) {}

   // Esempio — da copiare/adattare in ogni feature:
   //
   // load$ = createEffect(() =>
   //    this.actions$.pipe(
   //       ofType(load),
   //       switchMap(() =>
   //          this.myService.getData().pipe(
   //             map((data) => loadSuccess({ data })),
   //             catchError((error) => of(loadFailure({ error: error?.message ?? 'Errore sconosciuto' })))
   //          )
   //       )
   //    )
   // );
}
