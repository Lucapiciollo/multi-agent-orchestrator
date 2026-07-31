import { createFeatureState } from '../../../redux/feature-state.factory';

/**
 * Stato NgRx della sezione "Gestione Periodo". Sostituire `unknown` con il DTO reale
 * quando la libreria lib-gestione-periodo generata dal workflow espone i suoi modelli.
 */
export const gestione_periodoState = createFeatureState<unknown>('gestione-periodo');
export const { load, loadSuccess, loadFailure, reset } = gestione_periodoState.actions;
export const GestionePeriodoReducer = gestione_periodoState.reducer;
export const { selectStatus, selectData, selectError, selectIsLoading } = gestione_periodoState.selectors;
