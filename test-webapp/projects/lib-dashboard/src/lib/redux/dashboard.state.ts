// redux/dashboard.state.ts — lib-dashboard
import { Activity, Cliente, ClientiFilters, StatCard } from '../index.models';

export const featureKey = 'dashboard' as const;

export interface DashboardState {
  clienti: Cliente[];
  totalCount: number;
  page: number;
  filters: ClientiFilters | null;
  stats: StatCard[];
  activities: Activity[];
  loading: boolean;
  error: string | null;
}

export const initialState: DashboardState = {
  clienti: [],
  totalCount: 0,
  page: 1,
  filters: null,
  stats: [],
  activities: [],
  loading: false,
  error: null,
};
