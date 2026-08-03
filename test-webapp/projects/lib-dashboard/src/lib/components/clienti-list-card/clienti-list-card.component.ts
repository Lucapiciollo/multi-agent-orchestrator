// components/clienti-list-card/clienti-list-card.component.ts — lib-dashboard
// Orchestrazione: riceve dati/stato da IndexComponent via @Input(), inoltra
// gli eventi utente via @Output() (nessun accesso diretto allo store NgRx —
// solo IndexComponent legge tramite selector e scrive tramite dispatch).
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Cliente, ClientiFilters } from '../../index.models';

@Component({
  standalone: false,
  selector: 'lib-dashboard-clienti-list-card',
  templateUrl: './clienti-list-card.component.html',
  styleUrls: ['./clienti-list-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientiListCardComponent {
  @Input() clienti: Cliente[] = [];
  @Input() totalCount = 0;
  @Input() page = 1;
  @Input() loading = false;

  // T8 (nessun handler nel sorgente): refresh previsto come redispatch di loadClienti().
  @Output() readonly refresh = new EventEmitter<void>();
  // T9 (nessun handler nel sorgente): filtro previsto come loadClienti({filters}).
  @Output() readonly filter = new EventEmitter<ClientiFilters>();
  @Output() readonly resetFilter = new EventEmitter<void>();
  // T11 (nessun handler nel sorgente): paginazione prevista come setPage(n).
  @Output() readonly pageChange = new EventEmitter<number>();
}
