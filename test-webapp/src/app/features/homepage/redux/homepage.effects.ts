import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { load, loadFailure, loadSuccess } from './homepage.state';

/**
 * Effect della sezione "Homepage" (pattern EffectTemplate).
 * Oggi restituisce dati vuoti: quando la lib-homepage generata dallo skill
 * espone un servizio reale, va iniettato qui al posto del placeholder.
 */
@Injectable()
export class HomepageEffects {
   load$ = createEffect(() =>
      this.actions$.pipe(
         ofType(load),
         switchMap(() =>
            of(null).pipe(
               map((data) => loadSuccess({ data })),
               catchError((error) => of(loadFailure({ error: error?.message ?? 'Errore sconosciuto' })))
            )
         )
      )
   );

   constructor(private actions$: Actions) {}
}
