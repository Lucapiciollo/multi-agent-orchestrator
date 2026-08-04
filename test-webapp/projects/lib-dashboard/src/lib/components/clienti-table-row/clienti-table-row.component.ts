// components/clienti-table-row/clienti-table-row.component.ts — lib-dashboard
// Presentazionale (×N, @for track cliente.id): selettore ad attributo su
// <tr> (stesso pattern usato da Angular Material per mat-row/mat-cell), per
// preservare la semantica nativa della <table> del sorgente (righe 33-36)
// pur mantenendo "1 riga ripetuta = 1 componente" (regola skill).
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Cliente } from '../../index.models';

const STATO_LABELS: Record<Cliente['stato'], string> = {
  ok: 'Attivo',
  wait: 'In attesa',
  off: 'Sospeso',
};

const SEGMENTO_LABELS: Record<string, string> = {
  enterprise: 'Enterprise',
  pmi: 'PMI',
  startup: 'Startup',
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'tr[lib-dashboard-clienti-table-row]',
  templateUrl: './clienti-table-row.component.html',
  styleUrls: ['./clienti-table-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientiTableRowComponent {
  @Input({ required: true }) cliente!: Cliente;

  // T10 (nessun handler nel sorgente): "✎" (Modifica) e "⋯" (menu contestuale).
  @Output() readonly edit = new EventEmitter<Cliente>();
  @Output() readonly openMenu = new EventEmitter<Cliente>();

  get iniziali(): string {
    return this.cliente.nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  get statoLabel(): string {
    return STATO_LABELS[this.cliente.stato] ?? this.cliente.stato;
  }

  get segmentoLabel(): string {
    return SEGMENTO_LABELS[this.cliente.segmento] ?? this.cliente.segmento;
  }

  // Riproduce il formato "€ 48.500" del sorgente (riga 33) senza dover
  // registrare dati di locale Angular (registerLocaleData): Intl via
  // Number.prototype.toLocaleString è supportato nativamente dal runtime.
  get valoreFormattato(): string {
    return `€ ${this.cliente.valore.toLocaleString('it-IT')}`;
  }
}
