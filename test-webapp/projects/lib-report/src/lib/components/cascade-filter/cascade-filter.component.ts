import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

import { CascadingClient, CascadingCommessa, CascadingTask } from '../../index.models';

type CascadeLevel = 'cliente' | 'commessa' | 'task';
type CascadeOption = { id: string; label: string };

/**
 * components/cascade-filter/cascade-filter.component.ts
 *
 * Presentational, reusable — one level of the Cliente → Commessa → Task
 * cascade, bound to a FormControl owned by the parent form
 * (report-filters-step). Options are computed from CascadingClient[] (store-
 * held) filtered by the parent level's current value.
 *
 * AMBIGUITY-M-02 (resolved per architecture-report.md): MatSelect kept
 * (1:1 legacy behavior, no type-ahead) instead of MatAutocomplete.
 *
 * Replaces: openCascadeDropdown/selectCascadeOption (JS-036/037).
 */
@Component({
  selector: 'lib-report-cascade-filter',
  standalone: false,
  templateUrl: './cascade-filter.component.html',
  styleUrl: './cascade-filter.component.scss',
})
export class CascadeFilterComponent implements OnChanges {
  @Input({ required: true }) level!: CascadeLevel;
  @Input({ required: true }) control!: FormControl;
  @Input() label = '';

  /** Full cascading dataset (Cliente → Commessa → Task), read-only. */
  @Input() cascadingData: CascadingClient[] = [];

  /** Upstream selected id (cliente id for 'commessa' level, commessa id for 'task' level). */
  @Input() parentValue: string | null = null;

  options: CascadeOption[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cascadingData'] || changes['parentValue'] || changes['level']) {
      this.options = this.computeOptions();
    }
  }

  private computeOptions(): CascadeOption[] {
    if (this.level === 'cliente') {
      return this.cascadingData.map((client) => ({ id: client.id, label: client.label }));
    }

    if (this.level === 'commessa') {
      const client = this.cascadingData.find((c) => c.id === this.parentValue);
      return (client?.commesse ?? []).map((commessa: CascadingCommessa) => ({
        id: commessa.id,
        label: commessa.label,
      }));
    }

    // 'task' level
    for (const client of this.cascadingData) {
      const commessa = client.commesse.find((c) => c.id === this.parentValue);
      if (commessa) {
        return (commessa.task ?? []).map((task: CascadingTask) => ({ id: task.id, label: task.label }));
      }
    }
    return [];
  }
}
