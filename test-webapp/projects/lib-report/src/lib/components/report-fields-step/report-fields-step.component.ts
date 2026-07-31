import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfigForm, FormCompletionStats } from 'pl-dynamicform';

import { ReportFieldGroup } from '../../index.models';
import { buildGroupFieldsForm } from './report.fields-form.builder';

@Component({
  selector: 'lib-report-fields-step',
  standalone: false,
  templateUrl: './report-fields-step.component.html',
  styleUrl: './report-fields-step.component.scss',
})
export class ReportFieldsStepComponent implements OnChanges {
  @Input({ required: true }) fieldGroups!: ReportFieldGroup[];
  @Input({ required: true }) form!: FormGroup;

  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  /** Un ConfigForm per ogni gruppo — chiave = group.key */
  groupConfigs: Record<string, ConfigForm> = {};
  /** Conteggio campi selezionati per gruppo — aggiornato da completionChange */
  groupCounts: Record<string, number> = {};

  private collapsedGroups = new Set<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['fieldGroups'] || changes['form']) && this.fieldGroups && this.form) {
      this.buildGroupConfigs();
    }
  }

  private buildGroupConfigs(): void {
    this.groupConfigs = {};
    this.groupCounts = {};
    for (const group of this.fieldGroups) {
      const controls: Record<string, FormControl> = {};
      for (const field of group.fields) {
        const c = this.form.get(field.id);
        if (c instanceof FormControl) controls[field.id] = c;
      }
      this.groupConfigs[group.key] = buildGroupFieldsForm(group.fields, controls);
      this.groupCounts[group.key] = 0;
    }
  }

  onGroupCompletion(groupKey: string, stats: FormCompletionStats): void {
    this.groupCounts = { ...this.groupCounts, [groupKey]: stats.filled };
  }

  isOpen(groupKey: string): boolean { return !this.collapsedGroups.has(groupKey); }

  toggleCollapse(groupKey: string): void {
    if (this.collapsedGroups.has(groupKey)) this.collapsedGroups.delete(groupKey);
    else this.collapsedGroups.add(groupKey);
  }

  isGroupFullySelected(group: ReportFieldGroup): boolean {
    return group.fields.every(f => !!this.form.get(f.id)?.value);
  }

  isGroupPartiallySelected(group: ReportFieldGroup): boolean {
    const vals = group.fields.map(f => !!this.form.get(f.id)?.value);
    return vals.some(Boolean) && !vals.every(Boolean);
  }

  toggleGroupAll(group: ReportFieldGroup): void {
    const allSelected = this.isGroupFullySelected(group);
    group.fields.forEach(f => this.form.get(f.id)?.setValue(!allSelected));
  }

  get selectedCount(): number {
    return Object.values(this.groupCounts).reduce((a, b) => a + b, 0);
  }

  get hasSelection(): boolean { return this.selectedCount > 0; }

  onBack(): void { this.back.emit(); }
  onNext(): void { this.next.emit(); }
}
