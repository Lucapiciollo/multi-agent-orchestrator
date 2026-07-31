import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Guard applicata alle route delle sezioni del menu (e delle lib generate dalla skill).
 * Placeholder: oggi lascia sempre passare, ma e' gia' cablata su tutte le feature
 * route cosi' quando si integra l'auth reale (token/ruoli) basta implementare la logica qui.
 */
@Injectable({ providedIn: 'root' })
export class SectionGuard implements CanActivate, CanActivateChild {
   constructor(private router: Router) {}

   canActivate(): Observable<boolean | UrlTree> {
      return of(true);
   }

   canActivateChild(): Observable<boolean | UrlTree> {
      return of(true);
   }
}
