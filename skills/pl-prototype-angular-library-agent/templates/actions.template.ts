import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { __FEATURE_PASCAL__Item, __FEATURE_PASCAL__Filters } from '../models/__FEATURE__.models';

export const __FEATURE_PASCAL__Actions = createActionGroup({
  source: '__FEATURE_PASCAL__',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ items: __FEATURE_PASCAL__Item[] }>(),
    'Load Failure': props<{ error: string }>(),
    'Select': props<{ id: string | null }>(),
    'Set Filters': props<{ filters: __FEATURE_PASCAL__Filters }>(),
    'Clear Filters': emptyProps()
  }
});
