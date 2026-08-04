// components/stats-panel/stats-panel.component.ts — lib-dashboard
// Orchestrazione (wrapper @for): riceve gli stats via @Input(), nessuna
// dipendenza NgRx diretta (il valore arriva da IndexComponent tramite selector).
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StatCard } from '../../index.models';

@Component({
  selector: 'lib-dashboard-stats-panel',
  templateUrl: './stats-panel.component.html',
  styleUrls: ['./stats-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsPanelComponent {
  @Input() stats: StatCard[] = [];
}
