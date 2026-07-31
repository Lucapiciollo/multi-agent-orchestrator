import { createFeatureState } from '../../../redux/feature-state.factory';

/**
 * Stato NgRx della sezione "Commesse". Sostituire `unknown` con il DTO reale
 * quando la libreria lib-commesse generata dal workflow espone i suoi modelli.
 */
export const commesseState = createFeatureState<unknown>('commesse');
export const { load, loadSuccess, loadFailure, reset } = commesseState.actions;
export const CommesseReducer = commesseState.reducer;
export const { selectStatus, selectData, selectError, selectIsLoading } = commesseState.selectors;
