import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ReportPreset } from '../../index.models';

/**
 * components/report-preset-card/report-preset-card.component.ts
 *
 * Presentational, repeated (@for over subSection.presets). Renders one
 * clickable preset card; emits `select` with the preset label so the
 * parent (index.component) opens the wizard dialog at Step 3.
 *
 * Replaces: .report-card markup + onclick="openPreset(subId, presetLabel)".
 */
@Component({
  selector: 'lib-report-preset-card',
  standalone: false,
  templateUrl: './report-preset-card.component.html',
  styleUrl: './report-preset-card.component.scss',
})
export class ReportPresetCardComponent {
  @Input({ required: true }) preset!: ReportPreset;
  @Output() select = new EventEmitter<string>();

  onClick(): void {
    this.select.emit(this.preset.label);
  }
}
