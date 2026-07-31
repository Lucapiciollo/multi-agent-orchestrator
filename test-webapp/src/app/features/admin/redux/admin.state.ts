import { createFeatureState } from '../../../redux/feature-state.factory';

/**
 * Stato NgRx della sezione "Admin". Sostituire `unknown` con il DTO reale
 * quando la libreria lib-admin generata dal workflow espone i suoi modelli.
 */
export const adminState = createFeatureState<unknown>('admin');
export const { load, loadSuccess, loadFailure, reset } = adminState.actions;
export const AdminReducer = adminState.reducer;
export const { selectStatus, selectData, selectError, selectIsLoading } = adminState.selectors;
