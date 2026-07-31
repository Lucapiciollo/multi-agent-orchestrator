import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { load, loadFailure, loadSuccess } from './ferie-permessi.state';

/**
 * Effect della sezione "Ferie e Permessi" (pattern EffectTemplate).
 * Oggi restituisce dati vuoti: quando la lib-ferie-permessi generata dallo skill
 * espone un servizio reale, va iniettato qui al posto del placeholder.
 */
@Injectable()
export class FeriePermessiEffects {
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
