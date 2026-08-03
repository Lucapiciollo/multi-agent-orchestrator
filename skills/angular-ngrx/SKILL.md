# Angular NgRx Setup

**Scopo**: Creare il ciclo NgRx completo per una feature (state, actions, reducer, selectors, effects).

## Output (in `workspace/output/test-app/src/libs/{featureName}/redux/`)
- `{feature}.state.ts` — featureKey + interface + initialState
- `{feature}.actions.ts` — createActionGroup con Load/Success/Failure
- `{feature}.reducer.ts` — createReducer (export camelCase: featureReducer)
- `{feature}.selectors.ts` — createFeatureSelector + createSelector
- `{feature}.effects.ts` — switchMap + catchError
- `{feature}-store.module.ts` — NgModule con StoreModule.forFeature + EffectsModule.forFeature
- `index.ts` — re-export di tutto

## Regole
1. Naming: `featureReducer` (camelCase) NON `FeatureReducer`
2. Effects: `switchMap(() => service.getData().pipe(map(...), catchError(...)))`
3. Il service è chiamato SOLO dagli effects — MAI iniettato nei componenti
4. `featureKey = '{featureName}' as const`
