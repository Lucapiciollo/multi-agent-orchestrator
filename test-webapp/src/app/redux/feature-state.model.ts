/**
 * Modello generico per lo stato di una feature (pattern "remote data"):
 * ogni sezione del menu (Report, Periodo, Commesse, ecc.) e ogni libreria
 * generata dalla skill (lib-report, lib-periodo, ...) espone il suo store
 * secondo questa stessa forma, cosi' i componenti condivisi (loader, error banner)
 * funzionano in modo uniforme su tutta la web app.
 */
export type FeatureStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface FeatureState<T> {
   status: FeatureStatus;
   data: T | null;
   error: string | null;
}

export function initialFeatureState<T>(): FeatureState<T> {
   return {
      status: 'idle',
      data: null,
      error: null,
   };
}
