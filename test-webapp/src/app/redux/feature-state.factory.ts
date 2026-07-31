import { createAction, createFeatureSelector, createReducer, createSelector, on, props } from '@ngrx/store';
import { FeatureState, initialFeatureState } from './feature-state.model';

/**
 * Factory che genera Action + Reducer + Selector standard per una feature slice,
 * seguendo lo stesso schema di Action.ts / Redux.ts / Selector.ts del progetto
 * TimeVision (redux "a mano" sopra @ngrx/store), ma parametrizzato per essere
 * riusato identico da ogni sezione del menu e da ogni libreria generata.
 *
 * Uso tipico in una feature (es. report.state.ts):
 *
 *   export const reportState = createFeatureState<ReportDto[]>('report');
 *   export const { load, loadSuccess, loadFailure } = reportState.actions;
 *   export const reportReducer = reportState.reducer;
 *   export const { selectStatus, selectData, selectError } = reportState.selectors;
 */
export function createFeatureState<T>(featureKey: string) {
   const load = createAction(`[${featureKey}] Load`);
   const loadSuccess = createAction(`[${featureKey}] Load Success`, props<{ data: T }>());
   const loadFailure = createAction(`[${featureKey}] Load Failure`, props<{ error: string }>());
   const reset = createAction(`[${featureKey}] Reset`);

   const reducer = createReducer(
      initialFeatureState<T>(),
      on(load, (state): FeatureState<T> => ({ ...state, status: 'loading', error: null })),
      on(loadSuccess, (state, { data }): FeatureState<T> => ({ ...state, status: 'loaded', data, error: null })),
      on(loadFailure, (state, { error }): FeatureState<T> => ({ ...state, status: 'error', error })),
      on(reset, (): FeatureState<T> => initialFeatureState<T>())
   );

   const selectFeature = createFeatureSelector<FeatureState<T>>(featureKey);
   const selectStatus = createSelector(selectFeature, (state) => state.status);
   const selectData = createSelector(selectFeature, (state) => state.data);
   const selectError = createSelector(selectFeature, (state) => state.error);
   const selectIsLoading = createSelector(selectStatus, (status) => status === 'loading');

   return {
      featureKey,
      actions: { load, loadSuccess, loadFailure, reset },
      reducer,
      selectors: { selectFeature, selectStatus, selectData, selectError, selectIsLoading },
   };
}
