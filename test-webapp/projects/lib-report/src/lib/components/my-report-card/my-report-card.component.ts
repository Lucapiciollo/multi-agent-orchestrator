import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SavedReport } from '../../index.models';

/**
 * components/my-report-card/my-report-card.component.ts
 *
 * Presentational, repeated. Renders one saved-report card; emits `open` on
 * card click and `delete` on the "Elimina" icon click, without propagating
 * the click to the card ($event.stopPropagation() preserved, JS-053).
 *
 * Replaces: .my-report-card markup + onclick="openSavedReport(subId,index)"
 * and the "Elimina" onclick="deleteMyReport(subId,index)".
 */
@Component({
  selector: 'lib-report-my-report-card',
  standalone: false,
  templateUrl: './my-report-card.component.html',
  styleUrl: './my-report-card.component.scss',
})
export class MyReportCardComponent {
  @Input({ required: true }) report!: SavedReport;
  @Input({ required: true }) index!: number;

  @Output() open = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  onCardClick(): void {
    this.open.emit(this.index);
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.index);
  }
}
