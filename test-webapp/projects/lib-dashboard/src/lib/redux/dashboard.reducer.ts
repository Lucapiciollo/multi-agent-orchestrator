// redux/dashboard.reducer.ts — lib-dashboard
import { createReducer, on } from '@ngrx/store';
import { DashboardActions } from './dashboard.actions';
import { DashboardState, initialState } from './dashboard.state';

export const dashboardReducer = createReducer(
  initialState,

  on(DashboardActions.loadClienti, (state, { filters }): DashboardState => ({
    ...state,
    filters: filters ?? state.filters,
    loading: true,
    error: null,
  })),
  on(DashboardActions.loadClientiSuccess, (state, { items, total }): DashboardState => ({
    ...state,
    clienti: items,
    totalCount: total,
    loading: false,
  })),
  on(DashboardActions.loadClientiFailure, (state, { error }): DashboardState => ({
    ...state,
    loading: false,
    error,
  })),

  on(DashboardActions.setPage, (state, { page }): DashboardState => ({
    ...state,
    page,
  })),

  on(DashboardActions.createCliente, (state): DashboardState => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(DashboardActions.createClienteSuccess, (state, { item }): DashboardState => ({
    ...state,
    clienti: [item, ...state.clienti],
    totalCount: state.totalCount + 1,
    loading: false,
  })),
  on(DashboardActions.createClienteFailure, (state, { error }): DashboardState => ({
    ...state,
    loading: false,
    error,
  })),

  on(DashboardActions.updateProfilo, (state): DashboardState => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(DashboardActions.updateProfiloSuccess, (state): DashboardState => ({
    ...state,
    loading: false,
  })),
  on(DashboardActions.updateProfiloFailure, (state, { error }): DashboardState => ({
    ...state,
    loading: false,
    error,
  })),

  on(DashboardActions.loadStats, (state): DashboardState => ({
    ...state,
    error: null,
  })),
  on(DashboardActions.loadStatsSuccess, (state, { items }): DashboardState => ({
    ...state,
    stats: items,
  })),
  on(DashboardActions.loadStatsFailure, (state, { error }): DashboardState => ({
    ...state,
    error,
  })),

  on(DashboardActions.loadActivities, (state): DashboardState => ({
    ...state,
    error: null,
  })),
  on(DashboardActions.loadActivitiesSuccess, (state, { items }): DashboardState => ({
    ...state,
    activities: items,
  })),
  on(DashboardActions.loadActivitiesFailure, (state, { error }): DashboardState => ({
    ...state,
    error,
  }))
);
