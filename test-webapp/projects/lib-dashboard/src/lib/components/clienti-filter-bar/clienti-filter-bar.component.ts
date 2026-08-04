// components/clienti-filter-bar/clienti-filter-bar.component.ts — lib-dashboard
// Presentazionale: usa ReactiveFormsModule (già importato da LibDashboardModule).
// Nota architetturale: architecture-report.md §COMPONENTS PROPOSED indica
// pl-dynamicform come candidato per questo componente; il sorgente HTML
// (righe 31) usa però <input>/<select> nativi con CSS custom dedicato
// (.filters/.field), senza alcuno stile Material. Per rispettare la regola
// skill "Usa HTML nativo quando l'elemento ha styling custom" e la priorità
// di fedeltà visiva 100% (skill §3), questo componente riproduce il markup
// nativo del sorgente; la migrazione a pl-dynamicform resta un'evoluzione
// possibile nella fase dedicata di migrazione form (fuori scope di questo step).
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ClientiFilters } from '../../index.models';

@Component({
  selector: 'lib-dashboard-clienti-filter-bar',
  templateUrl: './clienti-filter-bar.component.html',
  styleUrls: ['./clienti-filter-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientiFilterBarComponent {
  // NOTA: inject() (anziché parametro di costruttore) per evitare "used
  // before its initialization" sull'initializer di `form` sotto (vedi stesso
  // pattern in index.component.ts).
  private readonly fb = inject(FormBuilder);

  // T9 (nessun handler nel sorgente): filtro/reset previsti come estensione
  // architetturale (loadClienti({filters}) dispatchato da IndexComponent).
  @Output() readonly filter = new EventEmitter<ClientiFilters>();
  @Output() readonly reset = new EventEmitter<void>();

  private static readonly EMPTY_VALUE = {
    ricerca: '',
    stato: '',
    segmento: '',
    accountManager: '',
  };

  readonly form = this.fb.group(ClientiFilterBarComponent.EMPTY_VALUE);

  onFiltra(): void {
    this.filter.emit(this.toFilters());
  }

  onReset(): void {
    this.form.reset(ClientiFilterBarComponent.EMPTY_VALUE);
    this.reset.emit();
  }

  private toFilters(): ClientiFilters {
    const raw = this.form.getRawValue();
    return {
      ricerca: raw.ricerca || undefined,
      stato: raw.stato || undefined,
      segmento: raw.segmento || undefined,
      accountManager: raw.accountManager || undefined,
    };
  }
}
