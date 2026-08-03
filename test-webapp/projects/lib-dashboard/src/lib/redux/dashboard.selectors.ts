// redux/dashboard.selectors.ts — lib-dashboard
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState, featureKey } from './dashboard.state';

export const selectDashboardState = createFeatureSelector<DashboardState>(featureKey);

export const selectClienti = createSelector(selectDashboardState, (state) => state.clienti);
export const selectTotalCount = createSelector(selectDashboardState, (state) => state.totalCount);
export const selectPage = createSelector(selectDashboardState, (state) => state.page);
export const selectFilters = createSelector(selectDashboardState, (state) => state.filters);
export const selectStats = createSelector(selectDashboardState, (state) => state.stats);
export const selectActivities = createSelector(selectDashboardState, (state) => state.activities);
export const selectLoading = createSelector(selectDashboardState, (state) => state.loading);
export const selectError = createSelector(selectDashboardState, (state) => state.error);
