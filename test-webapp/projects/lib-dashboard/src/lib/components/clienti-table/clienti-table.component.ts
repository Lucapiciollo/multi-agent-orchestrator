// components/clienti-table/clienti-table.component.ts — lib-dashboard
// Orchestrazione: renderizza la tabella clienti nativa (fedeltà 1:1 al
// sorgente, righe 32-37) delegando ogni riga a ClientiTableRowComponent
// (regola skill "ogni @for ripetuto = componente figlio").
//
// Nota architetturale: architecture-report.md §COMPONENTS PROPOSED assegna
// a questo componente il tipo "Orchestrazione (mat-table)"; il sorgente
// (righe 32-37) usa però una <table> nativa con CSS custom dedicato
// (.table-wrap/table/th/td), senza alcuno stile Material. La migrazione a
// mat-table+matColumnDef è esplicitamente segnalata come valutazione aperta
// in architecture-report.md §RISKS/AMBIGUITIES (nota 4) e demandata alla
// fase dedicata di migrazione template (fuori scope di questo step): qui si
// privilegia la fedeltà visiva 100% (skill §3) con markup HTML nativo.
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Cliente } from '../../index.models';

@Component({
  selector: 'lib-dashboard-clienti-table',
  templateUrl: './clienti-table.component.html',
  styleUrls: ['./clienti-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientiTableComponent {
  @Input() clienti: Cliente[] = [];

  // T10 (nessun handler nel sorgente): estensioni previste per riga.
  @Output() readonly edit = new EventEmitter<Cliente>();
  @Output() readonly openMenu = new EventEmitter<Cliente>();
}
