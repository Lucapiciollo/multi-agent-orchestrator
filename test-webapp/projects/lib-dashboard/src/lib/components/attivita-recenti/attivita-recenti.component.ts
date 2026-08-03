// components/attivita-recenti/attivita-recenti.component.ts — lib-dashboard
// Orchestrazione (wrapper @for): riceve le attività via @Input() da IndexComponent.
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Activity } from '../../index.models';

@Component({
  standalone: false,
  selector: 'lib-dashboard-attivita-recenti',
  templateUrl: './attivita-recenti.component.html',
  styleUrls: ['./attivita-recenti.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttivitaRecentiComponent {
  @Input() activities: Activity[] = [];

  // T13 (nessun handler nel sorgente): bottone "+" previsto come estensione.
  @Output() readonly addActivity = new EventEmitter<void>();
}
