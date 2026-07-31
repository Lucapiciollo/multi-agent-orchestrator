import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfigForm, FormCompletionStats } from 'pl-dynamicform';

import { CascadingClient, ReportFilterConfig } from '../../index.models';
import { buildReportFilterForm } from './report.filter-form.builder';

@Component({
  selector: 'lib-report-filters-step',
  standalone: false,
  templateUrl: './report-filters-step.component.html',
  styleUrl: './report-filters-step.component.scss',
})
export class ReportFiltersStepComponent implements OnChanges {
  @Input({ required: true }) filters!: ReportFilterConfig[];
  @Input({ required: true }) form!: FormGroup;
  @Input() cascadingData: CascadingClient[] = [];

  @Output() next = new EventEmitter<void>();
  /** Emette il numero di filtri compilati ad ogni cambio */
  @Output() filledChange = new EventEmitter<number>();

  filterConfig: ConfigForm = [];
  filledCount = 0;
  totalCount = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] || changes['cascadingData']) {
      this.rebuildConfig();
    }
  }

  onCompletion(stats: FormCompletionStats): void {
    this.filledCount = stats.filled;
    this.totalCount = stats.total;
    this.filledChange.emit(stats.filled);
  }

  private rebuildConfig(): void {
    if (!this.filters || !this.form) return;
    const controls: Record<string, FormControl> = {};
    for (const filter of this.filters) {
      const ctrl = this.form.get(filter.id);
      if (ctrl instanceof FormControl) controls[filter.id] = ctrl;
    }
    this.filterConfig = buildReportFilterForm(this.filters, this.cascadingData, controls);
  }

  onNext(): void { this.next.emit(); }
}

