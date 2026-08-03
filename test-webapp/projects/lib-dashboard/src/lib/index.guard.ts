// index.guard.ts — lib-dashboard
// DashboardGuard — CanActivate.
//
// ⚠️ PLACEHOLDER DOCUMENTATO: il sorgente HTML analizzato (Phase 0-7, vedi
// architecture-report.md §GUARD PROPOSED) non contiene alcuna regola di
// autorizzazione/accesso reale per la vista Dashboard (nessun controllo di
// permessi, ruolo o sessione rilevato in js-classification.md). Il guard
// ritorna quindi sempre `true` e resta come punto di estensione standard
// dell'architettura (da valorizzare quando sarà nota una vera policy di
// autorizzazione, es. controllo ruolo utente o feature flag).
//
// Registrato nei `providers` di LibDashboardModule (NON providedIn: 'root'),
// per regola skill Angular Component Extractor §2 (NgModule lib obbligatorio).
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class DashboardGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Placeholder: nessuna regola di accesso reale nel prototipo sorgente.
    return true;
  }
}
