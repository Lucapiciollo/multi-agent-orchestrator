import { createFeatureState } from '../../../redux/feature-state.factory';

/**
 * Stato NgRx della sezione "Ferie e Permessi". Sostituire `unknown` con il DTO reale
 * quando la libreria lib-ferie-permessi generata dal workflow espone i suoi modelli.
 */
export const ferie_permessiState = createFeatureState<unknown>('ferie-permessi');
export const { load, loadSuccess, loadFailure, reset } = ferie_permessiState.actions;
export const FeriePermessiReducer = ferie_permessiState.reducer;
export const { selectStatus, selectData, selectError, selectIsLoading } = ferie_permessiState.selectors;
