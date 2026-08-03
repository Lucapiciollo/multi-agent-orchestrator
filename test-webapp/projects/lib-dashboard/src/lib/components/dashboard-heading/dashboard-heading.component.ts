// components/dashboard-heading/dashboard-heading.component.ts — lib-dashboard
// Presentazionale: nessuna dipendenza da NgRx. Riceve solo Output() per gli
// eventi utente, delegando la logica (dispatch/apertura dialog) a IndexComponent.
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  standalone: false,
  selector: 'lib-dashboard-heading',
  templateUrl: './dashboard-heading.component.html',
  styleUrls: ['./dashboard-heading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeadingComponent {
  // JS T-? (nessun handler nel sorgente per "Esporta CSV"): estensione prevista.
  @Output() readonly exportCsv = new EventEmitter<void>();

  // JS-006 nel sorgente: apre il modale "Nuovo cliente" (gestito da IndexComponent).
  @Output() readonly openNuovoCliente = new EventEmitter<void>();
}
