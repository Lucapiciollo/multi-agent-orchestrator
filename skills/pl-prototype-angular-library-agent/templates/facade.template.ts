import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { __FEATURE_PASCAL__Actions } from './__FEATURE__.actions';
import { select__FEATURE_PASCAL__Vm } from './__FEATURE__.selectors';
import { __FEATURE_PASCAL__Filters } from '../models/__FEATURE__.models';

@Injectable({ providedIn: 'root' })
export class __FEATURE_PASCAL__Facade {
  readonly vm$ = this.store.select(select__FEATURE_PASCAL__Vm);

  constructor(private readonly store: Store) {}

  load(): void {
    this.store.dispatch(__FEATURE_PASCAL__Actions.load());
  }

  select(id: string | null): void {
    this.store.dispatch(__FEATURE_PASCAL__Actions.select({ id }));
  }

  setFilters(filters: __FEATURE_PASCAL__Filters): void {
    this.store.dispatch(__FEATURE_PASCAL__Actions.setFilters({ filters }));
  }

  clearFilters(): void {
    this.store.dispatch(__FEATURE_PASCAL__Actions.clearFilters());
  }
}
