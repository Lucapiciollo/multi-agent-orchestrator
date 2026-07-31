import { createFeatureState } from '../../../redux/feature-state.factory';

/**
 * Stato NgRx della sezione "Configurazioni". Sostituire `unknown` con il DTO reale
 * quando la libreria lib-configurazioni generata dal workflow espone i suoi modelli.
 */
export const configurazioniState = createFeatureState<unknown>('configurazioni');
export const { load, loadSuccess, loadFailure, reset } = configurazioniState.actions;
export const ConfigurazioniReducer = configurazioniState.reducer;
export const { selectStatus, selectData, selectError, selectIsLoading } = configurazioniState.selectors;
