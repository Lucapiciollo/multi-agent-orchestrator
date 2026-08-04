// components/stat-card/stat-card.component.ts — lib-dashboard
// Presentazionale (×4, @for track stat.id): riceve solo @Input(), nessuna
// lettura/scrittura di stato NgRx.
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StatCard } from '../../index.models';

@Component({
  selector: 'lib-dashboard-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  @Input({ required: true }) stat!: StatCard;
}
