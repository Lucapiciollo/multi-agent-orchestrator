import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { StoricoRecord } from '../../index.models';

/**
 * components/storico-table/storico-table.component.ts
 *
 * Presentational (data-in via @Input, actions out via @Output). Renders the
 * paginated Storico results table from an already-filtered/paginated page
 * slice supplied by the parent (index.component, via
 * selectFilteredStoricoPage/selectStoricoTotal). Owns no filtering/
 * pagination math itself — only rendering + event emission.
 *
 * Replaces: storico-tbody markup + renderStoricoTable() (JS-064),
 * storicoPage(dir)/page-size onchange (JS-067/068).
 */
@Component({
  selector: 'lib-report-storico-table',
  standalone: false,
  templateUrl: './storico-table.component.html',
  styleUrl: './storico-table.component.scss',
})
export class StoricoTableComponent implements OnChanges {
  @Input() rows: StoricoRecord[] = [];
  @Input() total = 0;
  @Input() pageIndex = 0;
  @Input() pageSize = 10;

  @Output() rowClick = new EventEmitter<StoricoRecord>();
  @Output() download = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();

  readonly displayedColumns = [
    'dataRichiesta',
    'template',
    'nomeFile',
    'versione',
    'dimensione',
    'formato',
    'stato',
    'azioni',
  ];

  dataSource: StoricoRecord[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows']) {
      this.dataSource = this.rows;
    }
  }

  onRowClick(row: StoricoRecord): void {
    this.rowClick.emit(row);
  }

  onDownloadClick(event: Event, row: StoricoRecord): void {
    event.stopPropagation();
    this.download.emit(row.id);
  }

  isDownloadDisabled(row: StoricoRecord): boolean {
    // Disabled solo per fallito e in-elaborazione (come l'originale)
    return row.stato === 'fallito' || row.stato === 'in-elaborazione';
  }

  onPage(event: PageEvent): void {
    this.pageChange.emit({ pageIndex: event.pageIndex, pageSize: event.pageSize });
  }
}
