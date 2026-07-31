import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ConfigForm } from 'pl-dynamicform';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { StoricoFilters } from '../../index.models';
import { buildStoricoFilterForm, StoricoFilterSignals } from './storico-filter.builder';

const DEFAULT_FORMAT_OPTIONS = ['csv', 'xlsx'];
const DEFAULT_STATO_OPTIONS  = ['accettato','in-elaborazione','pronto','scaricato','fallito','scaduto'];

@Component({
  selector: 'lib-report-storico-filter-bar',
  standalone: false,
  templateUrl: './storico-filter-bar.component.html',
  styleUrl: './storico-filter-bar.component.scss',
})
export class StoricoFilterBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filters: StoricoFilters | null = null;
  @Input() templateOptions: string[] = [];
  @Input() formatOptions:   string[] = DEFAULT_FORMAT_OPTIONS;
  @Input() statoOptions:    string[] = DEFAULT_STATO_OPTIONS;

  @Output() filtersChange = new EventEmitter<Partial<StoricoFilters>>();
  @Output() reset = new EventEmitter<void>();

  filterConfig: ConfigForm = [];
  private signals?: StoricoFilterSignals;

  private readonly destroy$ = new Subject<void>();
  private applyingExternalValue = false;

  readonly form: FormGroup = this.fb.group({
    dataRichiesta: [null as string | null],
    template:      [[] as string[]],
    nomeFile:      [''],
    formato:       [[] as string[]],
    stato:         [[] as string[]],
  });

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildConfig();

    this.form.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)), takeUntil(this.destroy$))
      .subscribe((value) => {
        if (!this.applyingExternalValue) this.filtersChange.emit(value as Partial<StoricoFilters>);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && this.filters) {
      this.applyingExternalValue = true;
      this.form.patchValue(this.filters, { emitEvent: false });
      this.applyingExternalValue = false;
    }
    // Aggiorna i Signal delle options quando cambiano gli @Input
    if (this.signals) {
      if (changes['templateOptions']) this.signals.templateOpts.set(this.templateOptions.map(o => ({ id: o, description: o })));
      if (changes['formatOptions'])   this.signals.formatoOpts.set(this.formatOptions.map(o => ({ id: o, description: o.toUpperCase() })));
      if (changes['statoOptions'])    this.signals.statoOpts.set(this.statoOptions.map(o => ({ id: o, description: capitalize(o) })));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onReset(): void {
    this.applyingExternalValue = true;
    this.form.reset({ dataRichiesta: null, template: [], nomeFile: '', formato: [], stato: [] }, { emitEvent: false });
    this.applyingExternalValue = false;
    this.reset.emit();
  }

  private buildConfig(): void {
    const result = buildStoricoFilterForm(
      {
        dataRichiesta: this.form.get('dataRichiesta') as FormControl,
        template:      this.form.get('template')      as FormControl,
        nomeFile:      this.form.get('nomeFile')      as FormControl,
        formato:       this.form.get('formato')       as FormControl,
        stato:         this.form.get('stato')         as FormControl,
      },
      this.templateOptions,
      this.formatOptions,
      this.statoOptions,
      () => this.onReset()
    );
    this.filterConfig = result.config;
    this.signals = result.signals;
  }
}

function capitalize(s: string): string {
  const label = s.replace(/-/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}
