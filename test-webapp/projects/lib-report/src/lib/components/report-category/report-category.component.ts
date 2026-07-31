import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ReportCategory, SavedReport } from '../../index.models';

/**
 * components/report-category/report-category.component.ts
 *
 * Presentational, repeated (@for, one instance per ReportCategory). Renders
 * the category header + MatExpansionPanel body containing its
 * report-sub-section children. Owns only its own expanded/collapsed local
 * UI boolean (transient — not store-worthy per architecture-report.md,
 * "STATE STRATEGY").
 *
 * Replaces: renderCategory(cat) (JS-022) + toggleCat(catId) local expand.
 */
@Component({
  selector: 'lib-report-category',
  standalone: false,
  templateUrl: './report-category.component.html',
  styleUrl: './report-category.component.scss',
})
export class ReportCategoryComponent {
  @Input({ required: true }) category!: ReportCategory;
  @Input() myReportsBySubId: Record<string, SavedReport[]> = {};

  @Output() openPreset = new EventEmitter<{ subId: string; presetLabel: string }>();
  @Output() openCustom = new EventEmitter<{ subId: string }>();
  @Output() openSavedReport = new EventEmitter<{ subId: string; index: number }>();
  @Output() deleteSavedReport = new EventEmitter<{ subId: string; index: number }>();

  /** Local UI-only state (expand/collapse) — never store-worthy. */
  expanded = true;

  get totalPresets(): number {
    return this.category.subSections.reduce((sum, s) => sum + s.presets.length, 0);
  }

  myReportsFor(subId: string): SavedReport[] {
    return this.myReportsBySubId[subId] ?? [];
  }
}
