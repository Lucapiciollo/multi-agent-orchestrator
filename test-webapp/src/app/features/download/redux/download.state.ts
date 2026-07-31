import { createFeatureState } from '../../../redux/feature-state.factory';

/**
 * Stato NgRx della sezione "Download". Sostituire `unknown` con il DTO reale
 * quando la libreria lib-download generata dal workflow espone i suoi modelli.
 */
export const downloadState = createFeatureState<unknown>('download');
export const { load, loadSuccess, loadFailure, reset } = downloadState.actions;
export const DownloadReducer = downloadState.reducer;
export const { selectStatus, selectData, selectError, selectIsLoading } = downloadState.selectors;
