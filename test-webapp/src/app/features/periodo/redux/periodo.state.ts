import { createFeatureState } from '../../../redux/feature-state.factory';

/**
 * Stato NgRx della sezione "Periodo". Sostituire `unknown` con il DTO reale
 * quando la libreria lib-periodo generata dal workflow espone i suoi modelli.
 */
export const periodoState = createFeatureState<unknown>('periodo');
export const { load, loadSuccess, loadFailure, reset } = periodoState.actions;
export const PeriodoReducer = periodoState.reducer;
export const { selectStatus, selectData, selectError, selectIsLoading } = periodoState.selectors;
