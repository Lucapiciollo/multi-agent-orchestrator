import { createFeatureSelector, createSelector } from '@ngrx/store';

import { REPORT_FEATURE_KEY, ReportState } from './report.state';

/**
 * report.selectors.ts — memoized selectors for the "Report" feature
 * (lib-report). index.component.ts (and its presentational children, via
 * @Input) MUST read feature state exclusively through these selectors.
 */
export const selectReportFeature =
  createFeatureSelector<ReportState>(REPORT_FEATURE_KEY);

// --- Report catalog ---
export const selectCategories = createSelector(
  selectReportFeature,
  (state) => state.categories
);

export const selectCategoriesLoading = createSelector(
  selectReportFeature,
  (state) => state.categoriesLoading
);

export const selectCategoriesError = createSelector(
  selectReportFeature,
  (state) => state.categoriesError
);

export const selectSubConfigById = (subId: string) =>
  createSelector(selectCategories, (categories) =>
    categories
      .flatMap((cat) => cat.subSections)
      .find((sub) => sub.subId === subId)
  );

export const selectCategoryLabelBySubId = (subId: string) =>
  createSelector(
    selectCategories,
    (categories) =>
      categories.find((cat) =>
        cat.subSections.some((sub) => sub.subId === subId)
      )?.label
  );

// --- Cascading data ---
export const selectCascadingData = createSelector(
  selectReportFeature,
  (state) => state.cascadingData
);

export const selectCascadingDataLoading = createSelector(
  selectReportFeature,
  (state) => state.cascadingDataLoading
);

// --- My reports ---
export const selectMyReports = createSelector(
  selectReportFeature,
  (state) => state.myReports
);

export const selectMyReportsBySubId = (subId: string) =>
  createSelector(selectMyReports, (myReports) => myReports[subId] ?? []);

// --- Storico ---
export const selectStoricoState = createSelector(
  selectReportFeature,
  (state) => state.storico
);

export const selectStoricoItems = createSelector(
  selectStoricoState,
  (storico) => storico.items
);

export const selectStoricoLoading = createSelector(
  selectStoricoState,
  (storico) => storico.loading
);

export const selectStoricoError = createSelector(
  selectStoricoState,
  (storico) => storico.error
);

export const selectStoricoFilters = createSelector(
  selectStoricoState,
  (storico) => storico.filters
);

export const selectStoricoPageIndex = createSelector(
  selectStoricoState,
  (storico) => storico.pageIndex
);

export const selectStoricoPageSize = createSelector(
  selectStoricoState,
  (storico) => storico.pageSize
);

export const selectStoricoById = (id: string) =>
  createSelector(selectStoricoItems, (items) =>
    items.find((item) => item.id === id)
  );

/** Applies the active StoricoFilters to the full item list (client-side). */
export const selectFilteredStoricoItems = createSelector(
  selectStoricoItems,
  selectStoricoFilters,
  (items, filters) =>
    items.filter((item) => {
      if (filters.dataRichiesta && item.dataRichiesta !== filters.dataRichiesta) {
        return false;
      }
      if (filters.template.length && !filters.template.includes(item.template)) {
        return false;
      }
      if (
        filters.nomeFile &&
        !item.nomeFile.toLowerCase().includes(filters.nomeFile.toLowerCase())
      ) {
        return false;
      }
      if (filters.formato.length && !filters.formato.includes(item.formato)) {
        return false;
      }
      if (filters.stato.length && !filters.stato.includes(item.stato)) {
        return false;
      }
      return true;
    })
);

export const selectStoricoTotal = createSelector(
  selectFilteredStoricoItems,
  (items) => items.length
);

/** Memoized filters + pageIndex/pageSize → current page slice. */
export const selectFilteredStoricoPage = createSelector(
  selectFilteredStoricoItems,
  selectStoricoPageIndex,
  selectStoricoPageSize,
  (items, pageIndex, pageSize) => {
    const start = pageIndex * pageSize;
    return items.slice(start, start + pageSize);
  }
);
