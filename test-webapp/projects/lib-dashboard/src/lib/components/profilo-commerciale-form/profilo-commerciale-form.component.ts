// components/profilo-commerciale-form/profilo-commerciale-form.component.ts — lib-dashboard
// Reactive form (JS-011): (ngSubmit) dispatcha ProfiloCommercialePayload via
// @Output() save, gestito da IndexComponent (dispatch DashboardActions.updateProfilo
// + feedback MatSnackBar, in sostituzione di alert('Demo: profilo salvato')).
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProfiloCommercialePayload } from '../../index.models';

// Valori iniziali identici al sorgente (riga 39).
const INITIAL_VALUE: ProfiloCommercialePayload = {
  nome: 'Andrea',
  cognome: 'Romano',
  azienda: 'Nova Systems S.p.A.',
  ruolo: 'CTO',
  email: 'andrea.romano@example.it',
  telefono: '+39 333 123 4567',
  priorita: 'Media',
  prossimoContatto: '2026-08-05',
  note: "Cliente interessato al rinnovo annuale e a un'estensione del pacchetto analytics.",
  newsletter: true,
  comunicazioniCommerciali: true,
  vip: false,
};

@Component({
  selector: 'lib-dashboard-profilo-form',
  templateUrl: './profilo-commerciale-form.component.html',
  styleUrls: ['./profilo-commerciale-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfiloCommercialeFormComponent {
  // NOTA: inject() (anziché parametro di costruttore) per evitare "used
  // before its initialization" sull'initializer di `form` sotto (vedi stesso
  // pattern in index.component.ts).
  private readonly fb = inject(FormBuilder);

  @Output() readonly save = new EventEmitter<ProfiloCommercialePayload>();
  // T12 (nessun handler nel sorgente): "Annulla" previsto come reset form.
  @Output() readonly cancel = new EventEmitter<void>();

  readonly form = this.fb.group({
    nome: [INITIAL_VALUE.nome, Validators.required],
    cognome: [INITIAL_VALUE.cognome, Validators.required],
    azienda: [INITIAL_VALUE.azienda],
    ruolo: [INITIAL_VALUE.ruolo],
    email: [INITIAL_VALUE.email, [Validators.required, Validators.email]],
    telefono: [INITIAL_VALUE.telefono],
    priorita: [INITIAL_VALUE.priorita],
    prossimoContatto: [INITIAL_VALUE.prossimoContatto],
    note: [INITIAL_VALUE.note],
    newsletter: [INITIAL_VALUE.newsletter],
    comunicazioniCommerciali: [INITIAL_VALUE.comunicazioniCommerciali],
    vip: [INITIAL_VALUE.vip],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue() as ProfiloCommercialePayload);
  }

  onAnnulla(): void {
    this.form.reset(INITIAL_VALUE);
    this.cancel.emit();
  }
}
