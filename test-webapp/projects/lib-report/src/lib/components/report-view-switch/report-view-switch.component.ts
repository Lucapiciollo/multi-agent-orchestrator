import { Component } from '@angular/core';

/**
 * components/report-view-switch/report-view-switch.component.ts
 *
 * Presentational sub-nav for the Elenco/Storico switch. Per Gate 2's
 * resolution of AMBIGUITY-C-01, the switch is implemented as real
 * routerLink navigation to the 'elenco'/'storico' guarded child routes
 * (index-routing.module.ts) — no @Input/@Output is needed, active state is
 * driven by routerLinkActive.
 *
 * Replaces: #sb-voce-report sub-items (#subitem-elenco / #subitem-storico)
 * and the showReportView('elenco'|'storico') onclick handlers (JS-059).
 */
@Component({
  selector: 'lib-report-view-switch',
  standalone: false,
  templateUrl: './report-view-switch.component.html',
  styleUrl: './report-view-switch.component.scss',
})
export class ReportViewSwitchComponent {}
