import {
  CascadingClient,
  ReportCategory,
  SavedReport,
  StoricoFilters,
  StoricoRecord,
} from '../index.models';

/**
 * report.state.ts — NgRx feature slice for the "Report" feature (lib-report)
 *
 * Feature state vs. component-local UI state (architecture-report.md,
 * "STATE STRATEGY"):
 *  - Store-owned: report catalog, cascading data, saved reports (CRUD),
 *    Storico items/filters/pagination/loading/error.
 *  - Component-local (NOT here): wizard step index / draft, category and
 *    sub-section expanded/active-tab booleans, period-picker open state.
 */
export const REPORT_FEATURE_KEY = 'report';

export interface StoricoState {
  items: StoricoRecord[];
  loading: boolean;
  error: string | null;
  filters: StoricoFilters;
  pageIndex: number;
  pageSize: number;
}

export interface ReportState {
  categories: ReportCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  cascadingData: CascadingClient[];
  cascadingDataLoading: boolean;
  cascadingDataError: string | null;

  /** Saved reports keyed by sub-section id (subId) */
  myReports: Record<string, SavedReport[]>;

  storico: StoricoState;
}

export const initialStoricoFilters: StoricoFilters = {
  dataRichiesta: null,
  template: [],
  nomeFile: '',
  formato: [],
  stato: [],
};

export const initialReportState: ReportState = {
  categories: [],
  categoriesLoading: false,
  categoriesError: null,

  cascadingData: [],
  cascadingDataLoading: false,
  cascadingDataError: null,

  myReports: {},

  storico: {
    items: [],
    loading: false,
    error: null,
    filters: initialStoricoFilters,
    pageIndex: 0,
    pageSize: 10,
  },
};

export interface ReportPartialState {
  readonly [REPORT_FEATURE_KEY]: ReportState;
}
