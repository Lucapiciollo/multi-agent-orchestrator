import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import {
  ReportActions,
  selectCascadingData,
  selectCategoryLabelBySubId,
  selectMyReportsBySubId,
  selectSubConfigById,
} from '../../redux';
import {
  CascadingClient,
  ReportFilterConfig,
  ReportSubSectionConfig,
  ReportWizardDialogData,
} from '../../index.models';

/** Pure filename formatting helper (replaces fmtFilename, JS-010). */
function fmtFilename(label: string, extension: string): string {
  const slug = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const date = new Date().toISOString().slice(0, 10);
  return `${slug}-${date}.${extension}`;
}

/** Default value per filter type (replaces getDefaultFilterValues, JS-012). */
function defaultFilterValue(filter: ReportFilterConfig): unknown {
  return filter.type === 'multiselect' ? [] : filter.type === 'text' ? '' : null;
}

/**
 * dialogs/report-wizard-dialog/report-wizard-dialog.component.ts
 *
 * MatDialog hosting the 3-step Report Wizard (MatStepper) — "smart-within-
 * dialog" per architecture-report.md ("DIALOGS PROPOSED"): owns the
 * wizard's Reactive Form/step state locally, dispatches store actions only
 * on confirmed Save/Update/Export, closes itself (MatDialogRef.close()) on
 * Update/Export (per legacy behavior — Save alone never closes the wizard).
 *
 * Receives MAT_DIALOG_DATA = ReportWizardDialogData ({ subId, mode,
 * presetLabel?, savedReportIndex? }). Builds the initial FormGroups from
 * the ReportSubSectionConfig read via selectSubConfigById(subId) + the
 * default-value helpers above.
 *
 * Replaces: #report-modal-overlay/.modal-container (D1), renderWizardContent
 * (JS-019), renderAndOpen/_restoreFieldValues (JS-025/026), closeWizard/
 * goWizardStep/startEditMode (JS-027/028/029), renderStepBar (JS-016).
 */
@Component({
  selector: 'lib-report-wizard-dialog',
  standalone: false,
  templateUrl: './report-wizard-dialog.component.html',
  styleUrl: './report-wizard-dialog.component.scss',
})
export class ReportWizardDialogComponent implements OnInit {
  readonly cascadingData$: Observable<CascadingClient[]> = this.store.select(selectCascadingData);
  readonly catLabel$: Observable<string | undefined> = this.store.select(selectCategoryLabelBySubId(this.data.subId));

  subSection: ReportSubSectionConfig | null = null;
  filtersForm!: FormGroup;
  fieldsForm!: FormGroup;
  saveForm!: FormGroup;

  // Inizializzato subito nel costruttore: preset/saved → step 2 (Riepilogo), custom → step 0 (Filtri)
  currentStepIndex: number;
  hasEdited = false;

  /** Step labels for the custom step bar */
  readonly wizardSteps = [
    { index: 0, label: 'Personalizza filtri' },
    { index: 1, label: 'Scegli campi' },
    { index: 2, label: 'Riepilogo' },
  ];

  /** Whether the stepper header is shown (hidden when opened at a preset, per JS-025). */
  get hideStepperHeader(): boolean {
    return this.data.mode === 'preset';
  }

  get filename(): string {
    return this.subSection ? fmtFilename(this.subSection.label, 'xlsx') : '';
  }

  get selectedFieldIds(): string[] {
    if (!this.fieldsForm) {
      return [];
    }
    return Object.entries(this.fieldsForm.value)
      .filter(([, selected]) => !!selected)
      .map(([fieldId]) => fieldId);
  }
  /** Etichette colonne selezionate per la tabella preview */
  get selectedFieldLabels(): string[] {
    if (!this.subSection || !this.fieldsForm) return [];
    return this.subSection.fieldGroups
      .flatMap((g) => g.fields)
      .filter((f) => !!this.fieldsForm.get(f.id)?.value)
      .map((f) => f.label);
  }
  constructor(
    private readonly store: Store,
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<ReportWizardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ReportWizardDialogData
  ) {
    // Step iniziale determinato PRIMA del primo render (evita flash del filtro step)
    this.currentStepIndex = (data.mode === 'preset' || data.mode === 'saved') ? 2 : 0;
  }

  ngOnInit(): void {
    this.store
      .select(selectSubConfigById(this.data.subId))
      .pipe(filter((subSection): subSection is ReportSubSectionConfig => !!subSection), take(1))
      .subscribe((subSection) => {
        this.subSection = subSection;
        this.buildForms(subSection);
        this.initializeStepAndValues();
      });
  }

  private buildForms(subSection: ReportSubSectionConfig): void {
    const filtersControls: Record<string, unknown[]> = {};
    for (const filterConfig of subSection.filters) {
      filtersControls[filterConfig.id] = [defaultFilterValue(filterConfig)];
    }
    this.filtersForm = this.fb.group(filtersControls);

    const allFieldsSelectedByDefault = this.data.mode !== 'custom';
    const fieldsControls: Record<string, boolean[]> = {};
    for (const group of subSection.fieldGroups) {
      for (const field of group.fields) {
        fieldsControls[field.id] = [allFieldsSelectedByDefault];
      }
    }
    this.fieldsForm = this.fb.group(fieldsControls);

    this.saveForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  private initializeStepAndValues(): void {
    if (this.data.mode === 'preset' || this.data.mode === 'saved') {
      this.currentStepIndex = 2;
    } else {
      this.currentStepIndex = 0;
    }

    if (this.data.mode === 'saved' && this.data.savedReportIndex !== undefined) {
      this.store
        .select(selectMyReportsBySubId(this.data.subId))
        .pipe(take(1))
        .subscribe((reports) => {
          const saved = reports[this.data.savedReportIndex as number];
          if (!saved) {
            return;
          }
          this.filtersForm.patchValue(saved.filterValues, { emitEvent: false });
          for (const fieldId of Object.keys(this.fieldsForm.controls)) {
            this.fieldsForm.get(fieldId)?.setValue(saved.selectedFieldIds.includes(fieldId), {
              emitEvent: false,
            });
          }
          this.saveForm.patchValue(
            { title: saved.title, description: saved.description },
            { emitEvent: false }
          );
        });
    }
  }

  goToStep(index: number): void {
    this.currentStepIndex = index;
  }

  onEdit(): void {
    this.hasEdited = true;
    this.currentStepIndex = 0;
  }

  onSave(): void {
    this.store.dispatch(
      ReportActions.saveMyReport({
        subId: this.data.subId,
        payload: {
          title: this.saveForm.value.title,
          description: this.saveForm.value.description,
          filterValues: this.filtersForm.value,
          selectedFieldIds: this.selectedFieldIds,
        },
      })
    );
    // Per legacy behavior (saveMyReport, JS-051) the wizard stays open after
    // a new custom report is saved — it does not close itself.
  }

  onUpdate(): void {
    this.store.dispatch(
      ReportActions.updateMyReport({
        subId: this.data.subId,
        index: this.data.savedReportIndex as number,
        payload: {
          title: this.saveForm.value.title,
          description: this.saveForm.value.description,
          filterValues: this.filtersForm.value,
          selectedFieldIds: this.selectedFieldIds,
        },
      })
    );
    this.dialogRef.close();
  }

  onExport(format: 'csv' | 'xlsx'): void {
    this.store.dispatch(
      ReportActions.requestExport({
        subId: this.data.subId,
        format,
        filters: this.filtersForm.value,
        columns: this.selectedFieldIds,
      })
    );
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
