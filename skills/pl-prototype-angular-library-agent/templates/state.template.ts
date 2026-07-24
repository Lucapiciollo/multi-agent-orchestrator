import { __FEATURE_PASCAL__Filters, __FEATURE_PASCAL__Item } from '../models/__FEATURE__.models';

export interface __FEATURE_PASCAL__State {
  loading: boolean;
  loaded: boolean;
  error: string | null;
  items: __FEATURE_PASCAL__Item[];
  selectedId: string | null;
  filters: __FEATURE_PASCAL__Filters;
}

export const initial__FEATURE_PASCAL__State: __FEATURE_PASCAL__State = {
  loading: false,
  loaded: false,
  error: null,
  items: [],
  selectedId: null,
  filters: {}
};
