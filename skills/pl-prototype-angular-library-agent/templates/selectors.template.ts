import { createFeatureSelector, createSelector } from '@ngrx/store';
import { __FEATURE_CAMEL__FeatureKey } from './__FEATURE__.reducer';
import { __FEATURE_PASCAL__State } from './__FEATURE__.state';

export const select__FEATURE_PASCAL__State = createFeatureSelector<__FEATURE_PASCAL__State>(__FEATURE_CAMEL__FeatureKey);

export const select__FEATURE_PASCAL__Loading = createSelector(select__FEATURE_PASCAL__State, (state) => state.loading);
export const select__FEATURE_PASCAL__Loaded = createSelector(select__FEATURE_PASCAL__State, (state) => state.loaded);
export const select__FEATURE_PASCAL__Error = createSelector(select__FEATURE_PASCAL__State, (state) => state.error);
export const select__FEATURE_PASCAL__Items = createSelector(select__FEATURE_PASCAL__State, (state) => state.items);
export const select__FEATURE_PASCAL__SelectedId = createSelector(select__FEATURE_PASCAL__State, (state) => state.selectedId);
export const select__FEATURE_PASCAL__Filters = createSelector(select__FEATURE_PASCAL__State, (state) => state.filters);

export const select__FEATURE_PASCAL__Vm = createSelector(
  select__FEATURE_PASCAL__Loading,
  select__FEATURE_PASCAL__Loaded,
  select__FEATURE_PASCAL__Error,
  select__FEATURE_PASCAL__Items,
  select__FEATURE_PASCAL__SelectedId,
  select__FEATURE_PASCAL__Filters,
  (loading, loaded, error, items, selectedId, filters) => ({ loading, loaded, error, items, selectedId, filters })
);
