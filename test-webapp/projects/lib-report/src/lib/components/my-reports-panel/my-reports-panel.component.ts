import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SavedReport } from '../../index.models';

/**
 * components/my-reports-panel/my-reports-panel.component.ts
 *
 * Presentational. Renders the empty state ("Nessun report salvato") or the
 * list of my-report-card items for one sub-section; forwards open/delete
 * events upward.
 *
 * Replaces: renderMyReportsPanel(subId) (JS-021).
 */
@Component({
  selector: 'lib-report-my-reports-panel',
  standalone: false,
  templateUrl: './my-reports-panel.component.html',
  styleUrl: './my-reports-panel.component.scss',
})
export class MyReportsPanelComponent {
  @Input() reports: SavedReport[] = [];
  @Output() open = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
}
