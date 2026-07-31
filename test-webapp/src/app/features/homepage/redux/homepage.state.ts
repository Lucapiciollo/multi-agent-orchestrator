import { createFeatureState } from '../../../redux/feature-state.factory';

/**
 * Stato NgRx della sezione "Homepage". Sostituire `unknown` con il DTO reale
 * quando la libreria lib-homepage generata dal workflow espone i suoi modelli.
 */
export const homepageState = createFeatureState<unknown>('homepage');
export const { load, loadSuccess, loadFailure, reset } = homepageState.actions;
export const HomepageReducer = homepageState.reducer;
export const { selectStatus, selectData, selectError, selectIsLoading } = homepageState.selectors;
