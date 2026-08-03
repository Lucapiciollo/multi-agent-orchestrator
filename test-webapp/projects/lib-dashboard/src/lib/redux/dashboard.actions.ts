// redux/dashboard.actions.ts — lib-dashboard
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Activity, Cliente, ClientiFilters, NuovoClientePayload, ProfiloCommercialePayload, StatCard } from '../index.models';

export const DashboardActions = createActionGroup({
  source: 'Dashboard',
  events: {
    'Load Clienti': props<{ filters?: ClientiFilters }>(),
    'Load Clienti Success': props<{ items: Cliente[]; total: number }>(),
    'Load Clienti Failure': props<{ error: string }>(),

    'Set Page': props<{ page: number }>(),

    'Create Cliente': props<{ payload: NuovoClientePayload }>(),
    'Create Cliente Success': props<{ item: Cliente }>(),
    'Create Cliente Failure': props<{ error: string }>(),

    'Update Profilo': props<{ payload: ProfiloCommercialePayload }>(),
    'Update Profilo Success': emptyProps(),
    'Update Profilo Failure': props<{ error: string }>(),

    'Load Stats': emptyProps(),
    'Load Stats Success': props<{ items: StatCard[] }>(),
    'Load Stats Failure': props<{ error: string }>(),

    'Load Activities': emptyProps(),
    'Load Activities Success': props<{ items: Activity[] }>(),
    'Load Activities Failure': props<{ error: string }>(),
  },
});
