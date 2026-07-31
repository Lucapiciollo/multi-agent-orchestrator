import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDeleteDialogData {
  subId: string;
  index: number;
}

/**
 * dialogs/confirm-delete-dialog/confirm-delete-dialog.component.ts
 *
 * Generic, reusable confirmation MatDialog. Receives { subId, index } via
 * MAT_DIALOG_DATA so the caller (index.component) can dispatch
 * deleteMyReport({ subId, index }) on afterClosed() resolving true. This
 * dialog itself never touches the store — it only returns a boolean.
 *
 * Per AMBIGUITY-D2-02 (dialogs-inventory.md), the confirmation message is
 * preserved static (does not interpolate the report title), per the
 * strict-equivalence default.
 *
 * Replaces: #confirm-overlay/.confirm-box (D2), cancelDelete/confirmDelete
 * (JS-054/055) — dialogRef.close(true|false) pattern.
 */
@Component({
  selector: 'lib-report-confirm-delete-dialog',
  standalone: false,
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrl: './confirm-delete-dialog.component.scss',
})
export class ConfirmDeleteDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmDeleteDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ConfirmDeleteDialogData
  ) {}

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
