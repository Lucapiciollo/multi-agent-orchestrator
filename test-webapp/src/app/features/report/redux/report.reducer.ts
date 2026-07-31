import { createReducer, on } from '@ngrx/store';

import { initialReportState, initialStoricoFilters, ReportState } from './report.state';
import { ReportActions } from './report.actions';

/**
 * report.reducer.ts — pure reducer for the "Report" feature (lib-report)
 *
 * Handles all ReportActions against ReportState, including immutable
 * insert/replace/remove on myReports[subId] and filter/page/pageSize slice
 * updates for Storico.
 */
export const reportReducer = createReducer(
  initialReportState,

  // --- Report catalog ---
  on(ReportActions.loadReportCatalog, (state): ReportState => ({
    ...state,
    categoriesLoading: true,
    categoriesError: null,
  })),
  on(ReportActions.loadReportCatalogSuccess, (state, { categories }): ReportState => ({
    ...state,
    categories,
    categoriesLoading: false,
    categoriesError: null,
  })),
  on(ReportActions.loadReportCatalogFailure, (state, { error }): ReportState => ({
    ...state,
    categoriesLoading: false,
    categoriesError: error,
  })),

  // --- Cascading data ---
  on(ReportActions.loadCascadingData, (state): ReportState => ({
    ...state,
    cascadingDataLoading: true,
    cascadingDataError: null,
  })),
  on(ReportActions.loadCascadingDataSuccess, (state, { cascadingData }): ReportState => ({
    ...state,
    cascadingData,
    cascadingDataLoading: false,
    cascadingDataError: null,
  })),
  on(ReportActions.loadCascadingDataFailure, (state, { error }): ReportState => ({
    ...state,
    cascadingDataLoading: false,
    cascadingDataError: error,
  })),

  // --- My reports CRUD ---
  on(ReportActions.saveMyReportSuccess, (state, { subId, report }): ReportState => ({
    ...state,
    myReports: {
      ...state.myReports,
      [subId]: [...(state.myReports[subId] ?? []), report],
    },
  })),
  on(ReportActions.updateMyReportSuccess, (state, { subId, index, report }): ReportState => {
    const existing = state.myReports[subId] ?? [];
    const updated = existing.map((item, i) => (i === index ? report : item));
    return {
      ...state,
      myReports: {
        ...state.myReports,
        [subId]: updated,
      },
    };
  }),
  on(ReportActions.deleteMyReportSuccess, (state, { subId, index }): ReportState => {
    const existing = state.myReports[subId] ?? [];
    const updated = existing.filter((_, i) => i !== index);
    return {
      ...state,
      myReports: {
        ...state.myReports,
        [subId]: updated,
      },
    };
  }),

  // --- Storico ---
  on(ReportActions.loadStorico, (state): ReportState => ({
    ...state,
    storico: { ...state.storico, loading: true, error: null },
  })),
  on(ReportActions.loadStoricoSuccess, (state, { items }): ReportState => ({
    ...state,
    storico: { ...state.storico, items, loading: false, error: null },
  })),
  on(ReportActions.loadStoricoFailure, (state, { error }): ReportState => ({
    ...state,
    storico: { ...state.storico, loading: false, error },
  })),
  on(ReportActions.setStoricoFilters, (state, { filters }): ReportState => ({
    ...state,
    storico: {
      ...state.storico,
      filters: { ...state.storico.filters, ...filters },
      pageIndex: 0,
    },
  })),
  on(ReportActions.resetStoricoFilters, (state): ReportState => ({
    ...state,
    storico: {
      ...state.storico,
      filters: initialStoricoFilters,
      pageIndex: 0,
    },
  })),
  on(ReportActions.setStoricoPage, (state, { pageIndex }): ReportState => ({
    ...state,
    storico: { ...state.storico, pageIndex },
  })),
  on(ReportActions.setStoricoPageSize, (state, { pageSize }): ReportState => ({
    ...state,
    storico: { ...state.storico, pageSize, pageIndex: 0 },
  })),

  // --- Export ---
  on(ReportActions.requestExportSuccess, (state, { record }): ReportState => ({
    ...state,
    storico: {
      ...state.storico,
      items: [record, ...state.storico.items],
    },
  })),

  // --- Storico download ---
  on(ReportActions.downloadStoricoSuccess, (state, { record }): ReportState => ({
    ...state,
    storico: {
      ...state.storico,
      items: state.storico.items.map((item) =>
        item.id === record.id ? record : item
      ),
    },
  }))
);
