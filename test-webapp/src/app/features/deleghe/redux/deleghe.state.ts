import { createFeatureState } from '../../../redux/feature-state.factory';

/**
 * Stato NgRx della sezione "Deleghe". Sostituire `unknown` con il DTO reale
 * quando la libreria lib-deleghe generata dal workflow espone i suoi modelli.
 */
export const delegheState = createFeatureState<unknown>('deleghe');
export const { load, loadSuccess, loadFailure, reset } = delegheState.actions;
export const DelegheReducer = delegheState.reducer;
export const { selectStatus, selectData, selectError, selectIsLoading } = delegheState.selectors;
