import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { selectStoricoById } from '../../redux';
import { StoricoRecord } from '../../index.models';

export interface StoricoDetailDialogData {
  id: string;
}

/**
 * dialogs/storico-detail-dialog/storico-detail-dialog.component.ts
 *
 * Read-only MatDialog. Receives the target record's id via MAT_DIALOG_DATA
 * and resolves the full record via selectStoricoById(id) — reads the store
 * exclusively through this selector, never mutates it (no confirm/cancel
 * action besides closing).
 *
 * Replaces: #storico-modal-overlay/.storico-modal (D3), openStoricoDetail
 * (JS-069, imperative population replaced by declarative bindings),
 * closeStoricoDetail (JS-070).
 */
@Component({
  selector: 'lib-report-storico-detail-dialog',
  standalone: false,
  templateUrl: './storico-detail-dialog.component.html',
  styleUrl: './storico-detail-dialog.component.scss',
})
export class StoricoDetailDialogComponent {
  readonly record$: Observable<StoricoRecord | undefined> = this.store.select(
    selectStoricoById(this.data.id)
  );

  constructor(
    private readonly store: Store,
    private readonly dialogRef: MatDialogRef<StoricoDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: StoricoDetailDialogData
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  filtriEntries(record: StoricoRecord): { key: string; value: unknown }[] {
    return Object.entries(record.filtriApplicati ?? {}).map(([key, value]) => ({ key, value }));
  }
}
