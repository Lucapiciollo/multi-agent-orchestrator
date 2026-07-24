import { createReducer, on } from '@ngrx/store';
import { __FEATURE_PASCAL__Actions } from './__FEATURE__.actions';
import { initial__FEATURE_PASCAL__State } from './__FEATURE__.state';

export const __FEATURE_CAMEL__FeatureKey = '__FEATURE__';

export const __FEATURE_CAMEL__Reducer = createReducer(
  initial__FEATURE_PASCAL__State,
  on(__FEATURE_PASCAL__Actions.load, (state) => ({ ...state, loading: true, error: null })),
  on(__FEATURE_PASCAL__Actions.loadSuccess, (state, { items }) => ({ ...state, loading: false, loaded: true, items })),
  on(__FEATURE_PASCAL__Actions.loadFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(__FEATURE_PASCAL__Actions.select, (state, { id }) => ({ ...state, selectedId: id })),
  on(__FEATURE_PASCAL__Actions.setFilters, (state, { filters }) => ({ ...state, filters })),
  on(__FEATURE_PASCAL__Actions.clearFilters, (state) => ({ ...state, filters: {} }))
);
