/**
 * Root application state.
 * Ogni feature module registra la propria slice tramite StoreModule.forFeature(),
 * quindi qui manteniamo solo lo scheletro: le chiavi vengono aggiunte dinamicamente
 * a runtime (vedi FeatureState in ./feature-state.model.ts).
 */
export interface AppState {
   [featureKey: string]: unknown;
}
