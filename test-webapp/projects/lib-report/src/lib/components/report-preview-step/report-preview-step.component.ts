import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ReportWizardDialogMode } from '../../index.models';

/**
 * components/report-preview-step/report-preview-step.component.ts
 *
 * Presentational-with-form — Wizard Step 3 ("Riepilogo"). Renders the
 * preview meta bar (column count + generated filename), a skeleton preview
 * table, and the conditional Save/Update accordion (title/description,
 * Validators.required applied by the parent form). Emits `save`/`update`/
 * `edit`/`export` upward to the dialog container, which dispatches the
 * corresponding NgRx actions.
 *
 * Replaces: renderPreview (JS-018), toggleSaveAccordion (JS-050, local UI
 * state here), doExport trigger side (JS-048).
 */
@Component({
  selector: 'lib-report-preview-step',
  standalone: false,
  templateUrl: './report-preview-step.component.html',
  styleUrl: './report-preview-step.component.scss',
})
export class ReportPreviewStepComponent {
  @Input({ required: true }) mode!: ReportWizardDialogMode;
  @Input() hasEdited = false;
  @Input() columnsCount = 0;
  @Input() filename = '';
  @Input() columnLabels: string[] = [];  // etichette colonne selezionate (per la tabella preview)
  @Input({ required: true }) saveForm!: FormGroup;

  @Output() back = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() update = new EventEmitter<void>();
  @Output() exportRequested = new EventEmitter<'csv' | 'xlsx'>();

  /** Local UI-only state (JS-050 toggleSaveAccordion) — never store-worthy. */
  saveAccordionExpanded = true;

  get showSaveForm(): boolean {
    return this.mode === 'custom' || this.hasEdited;
  }

  get showEditButton(): boolean {
    return (this.mode === 'preset' || this.mode === 'saved') && !this.hasEdited;
  }

  get isUpdateMode(): boolean {
    return this.mode === 'saved';
  }

  onExport(format: 'csv' | 'xlsx'): void {
    this.exportRequested.emit(format);
  }

  onSaveOrUpdate(): void {
    if (this.saveForm.invalid) {
      this.saveForm.markAllAsTouched();
      return;
    }
    if (this.isUpdateMode) {
      this.update.emit();
    } else {
      this.save.emit();
    }
  }
}
