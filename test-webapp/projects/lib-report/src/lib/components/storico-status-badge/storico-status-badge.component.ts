import { Component, Input } from '@angular/core';

/** Status → { label, cssClass } mapping (replaces legacy _sBadge, JS-013). */
const STATUS_MAP: Record<string, { label: string; cssClass: string }> = {
  accettato: { label: 'Accettato', cssClass: 'sb-accettato' },
  'in-elaborazione': { label: 'In progress', cssClass: 'sb-in-progress' },
  pronto: { label: 'Pronto', cssClass: 'sb-pronto' },
  scaricato: { label: 'Scaricato', cssClass: 'sb-scaricato' },
  fallito: { label: 'Fallito', cssClass: 'sb-fallito' },
  scaduto: { label: 'Scaduto', cssClass: 'sb-scaduto' },
};

/**
 * components/storico-status-badge/storico-status-badge.component.ts
 *
 * Presentational, small repeated unit (reused by storico-table and
 * storico-detail-dialog). Renders the colored status chip from a `stato`
 * code.
 *
 * The status→class/label mapping logic that used to live in a dedicated
 * StoricoStatusPipe (per architecture-report.md, "SERVICES PROPOSED") is
 * implemented directly inside this component, since pipes/ is outside this
 * step's authorized output scope (index.component/components//dialogs//
 * mock-data/ only) — a future step may extract it into a shared pipe
 * without changing this component's public API.
 *
 * Replaces: _sBadge(stato) (JS-013).
 */
@Component({
  selector: 'lib-report-storico-status-badge',
  standalone: false,
  templateUrl: './storico-status-badge.component.html',
  styleUrl: './storico-status-badge.component.scss',
})
export class StoricoStatusBadgeComponent {
  @Input({ required: true }) stato!: string;

  get label(): string {
    return STATUS_MAP[this.stato]?.label ?? this.stato;
  }

  get cssClass(): string {
    return STATUS_MAP[this.stato]?.cssClass ?? 'sb-default';
  }
}
