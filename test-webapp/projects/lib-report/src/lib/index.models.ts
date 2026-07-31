/**
 * index.models.ts — "Report" feature (slug: lib-report)
 *
 * All TypeScript interfaces for the feature, as committed to in
 * workspace/output/angular/reports/architecture-report.md (section
 * "MODELS / INTERFACES (index.models.ts)"). Consumed by index.service.ts,
 * redux/*, and the presentational components generated in the next
 * atomic step (Phase 8b — UI components).
 */

export type ReportFilterType =
  | 'text'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'periodo'
  | 'cascade-cliente'
  | 'cascade-commessa'
  | 'cascade-task';

export interface ReportFilterOption {
  value: string;
  label: string;
}

export interface ReportFilterConfig {
  id: string;
  type: ReportFilterType;
  label: string;
  options?: ReportFilterOption[];
  /** id of the filter this one depends on (cascade / dependent-field wiring) */
  dependsOn?: string;
}

export interface ReportFieldGroupField {
  id: string;
  label: string;
}

export interface ReportFieldGroup {
  key: string;
  label: string;
  fields: ReportFieldGroupField[];
}

export interface ReportPreset {
  label: string;
  description: string;
}

export interface ReportSubSectionConfig {
  subId: string;
  catId: string;
  label: string;
  presets: ReportPreset[];
  filters: ReportFilterConfig[];
  fieldGroups: ReportFieldGroup[];
}

export interface ReportCategory {
  catId: string;
  label: string;
  icon: string;
  subSections: ReportSubSectionConfig[];
}

export interface SavedReport {
  title: string;
  description: string;
  filterValues: Record<string, unknown>;
  selectedFieldIds: string[];
}

export interface CascadingTask {
  id: string;
  label: string;
}

export interface CascadingCommessa {
  id: string;
  label: string;
  task: CascadingTask[];
}

export interface CascadingClient {
  id: string;
  label: string;
  commesse: CascadingCommessa[];
}

export type StoricoStato = 'in-elaborazione' | 'pronto' | 'fallito' | string;

export interface StoricoRecord {
  id: string;
  dataRichiesta: string;
  template: string;
  nomeFile: string;
  versione: string;
  dimensione: string;
  formato: string;
  stato: StoricoStato;
  dataDownload?: string;
  dataFallimento?: string;
  filtriApplicati: Record<string, unknown>;
  colonneIncluse: string[];
}

export interface StoricoFilters {
  dataRichiesta: string | null;
  template: string[];
  nomeFile: string;
  formato: string[];
  stato: string[];
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  total: number;
}

export type ReportWizardDialogMode = 'preset' | 'custom' | 'saved';

export interface ReportWizardDialogData {
  subId: string;
  mode: ReportWizardDialogMode;
  presetLabel?: string;
  savedReportIndex?: number;
}
