import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

/**
 * index.guard.ts — "Report" feature (slug: lib-report)
 *
 * PLACEHOLDER GUARD — see architecture-report.md, section "GUARD PROPOSED".
 *
 * No explicit authorization rule was found in the legacy prototype for the
 * "Report" menu entry: it is unconditionally visible and reachable from the
 * sidebar. Per the mandatory rule "every route must be guarded, even when
 * the guard currently just returns true", this guard is still generated and
 * wired into both `report/elenco` and `report/storico` child routes in
 * index-routing.module.ts.
 *
 * Replace the placeholder `true` with a real permission check (e.g.
 * `this.authService.hasPermission('report:view')`) if/when the target
 * application defines one.
 */
@Injectable()
export class ReportGuard implements CanActivate {
  canActivate(): boolean {
    // Placeholder: no access rule exists in the source prototype.
    return true;
  }
}
