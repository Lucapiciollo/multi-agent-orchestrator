import { createFeatureState } from '../../../redux/feature-state.factory';

/**
 * Stato NgRx della sezione "Documentazione". Sostituire `unknown` con il DTO reale
 * quando la libreria lib-documentazione generata dal workflow espone i suoi modelli.
 */
export const documentazioneState = createFeatureState<unknown>('documentazione');
export const { load, loadSuccess, loadFailure, reset } = documentazioneState.actions;
export const DocumentazioneReducer = documentazioneState.reducer;
export const { selectStatus, selectData, selectError, selectIsLoading } = documentazioneState.selectors;
