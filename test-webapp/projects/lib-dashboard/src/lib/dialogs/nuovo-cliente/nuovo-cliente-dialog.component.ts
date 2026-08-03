// dialogs/nuovo-cliente/nuovo-cliente-dialog.component.ts — lib-dashboard
// MatDialog component (unico dialog in scope per la sezione Dashboard, vedi
// dialogs-inventory.md §2.1 e architecture-report.md §DIALOGS PROPOSED).
//
// Nota su cdkFocusInitial: il modulo lib (index.module.ts, fuori dagli
// "Output autorizzati" di questo step) non importa A11yModule, necessario
// per la direttiva `cdkFocusInitial`. Per rispettare comunque il
// comportamento richiesto (focus iniziale sul campo "Nome", in sostituzione
// di JS-005c `setTimeout(...,50)`) senza richiedere modifiche fuori scope,
// il focus iniziale va configurato dal chiamante (IndexComponent) tramite
// `MatDialogConfig.autoFocus: 'first-tabbable'` in `dialog.open(...)`
// (il campo Nome è il primo elemento tabbable del form).
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NuovoClientePayload } from '../../index.models';

@Component({
  standalone: false,
  selector: 'lib-dashboard-nuovo-cliente-dialog',
  templateUrl: './nuovo-cliente-dialog.component.html',
  styleUrls: ['./nuovo-cliente-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuovoClienteDialogComponent {
  // NOTA: inject() (anziché parametri di costruttore) per evitare "used
  // before its initialization" sull'initializer di `form` sotto (vedi stesso
  // pattern in index.component.ts).
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<NuovoClienteDialogComponent, NuovoClientePayload>);

  // Validators.required/email: raccomandazione architetturale (nessuna
  // validazione JS preesistente nel sorgente, vedi architecture-report.md
  // §RISKS/AMBIGUITIES nota 6).
  readonly form = this.fb.group({
    nome: ['', Validators.required],
    cognome: ['', Validators.required],
    azienda: [''],
    email: ['', [Validators.required, Validators.email]],
    segmento: ['Enterprise'],
    statoIniziale: ['In attesa'],
    note: [''],
  });

  // JS-007/JS-008/JS-009/JS-010 (quota modale): chiusura nativa MatDialog
  // (×, Annulla, click backdrop, Escape — nessuno stato booleano manuale).
  onClose(): void {
    this.dialogRef.close();
  }

  // T6 (nessun handler nel sorgente per "Crea cliente"): il payload viene
  // restituito ad afterClosed(), che IndexComponent usa per dispatchare
  // DashboardActions.createCliente(payload).
  onCrea(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue() as NuovoClientePayload);
  }
}
