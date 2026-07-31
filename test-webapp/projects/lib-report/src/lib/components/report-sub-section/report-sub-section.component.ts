import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ReportSubSectionConfig, SavedReport } from '../../index.models';

/**
 * components/report-sub-section/report-sub-section.component.ts
 *
 * Presentational, repeated (@for, one instance per ReportSubSectionConfig).
 * Renders the 2-tab region ("Report preimpostati" / "I miei report" with
 * badge), the preset list, the "I miei report" panel, and the "Personalizza
 * nuovo report" footer. Emits events upward — dialog opening stays in
 * index.component (per component-breakdown.md #4).
 *
 * Replaces: renderSubSectionWithTabs/renderSubSection (JS-020),
 * switchTsTab (local active-tab state, not store-worthy).
 */
@Component({
  selector: 'lib-report-sub-section',
  standalone: false,
  templateUrl: './report-sub-section.component.html',
  styleUrl: './report-sub-section.component.scss',
})
export class ReportSubSectionComponent {
  @Input({ required: true }) subSection!: ReportSubSectionConfig;
  @Input() myReports: SavedReport[] = [];

  @Output() openPreset = new EventEmitter<{ subId: string; presetLabel: string }>();
  @Output() openCustom = new EventEmitter<{ subId: string }>();
  @Output() openSavedReport = new EventEmitter<{ subId: string; index: number }>();
  @Output() deleteSavedReport = new EventEmitter<{ subId: string; index: number }>();

  /** Local UI-only state (active tab) — never store-worthy. */
  activeTab: 'preimpostati' | 'miei' = 'preimpostati';

  onSelectPreset(presetLabel: string): void {
    this.openPreset.emit({ subId: this.subSection.subId, presetLabel });
  }

  onOpenCustom(): void {
    this.openCustom.emit({ subId: this.subSection.subId });
  }

  onOpenSavedReport(index: number): void {
    this.openSavedReport.emit({ subId: this.subSection.subId, index });
  }

  onDeleteSavedReport(index: number): void {
    this.deleteSavedReport.emit({ subId: this.subSection.subId, index });
  }
}
