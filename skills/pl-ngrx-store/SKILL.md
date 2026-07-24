---
name: pl-ngrx-store
description: Generazione e validazione dello store NgRx per librerie Angular enterprise. Copre feature state isolato, actions, reducer, effects, selectors, facade pattern, loading/error handling e integrazione con Signals.
---

# PL NgRx Store Agent

## Obiettivo

Genera, valida e rifattorizza lo store NgRx di una libreria Angular enterprise rispettando i pattern approvati da Luca: feature state isolato, facade obbligatoria, loading ed error state espliciti.

---

## Struttura store target

```
src/lib/store/
  <feature>.actions.ts        ← azioni tipizzate
  <feature>.reducer.ts        ← reducer puro
  <feature>.effects.ts        ← side effect (API calls)
  <feature>.selectors.ts      ← selectors memoizzati
  <feature>.facade.ts         ← UNICO punto di accesso per i componenti
  <feature>.state.ts          ← interfaccia dello stato + initialState
  index.ts                    ← barrel export
```

---

## Pattern obbligatori

### State interface

```typescript
export interface FeatureState {
  items: Item[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialState: FeatureState = {
  items: [],
  selectedId: null,
  loading: false,
  error: null,
};
```

### Actions (gruppi)

```typescript
// Usa createActionGroup per raggruppare azioni correlate
export const FeatureActions = createActionGroup({
  source: 'Feature',
  events: {
    'Load Items':        emptyProps(),
    'Load Items Success': props<{ items: Item[] }>(),
    'Load Items Failure': props<{ error: string }>(),
    'Select Item':       props<{ id: string }>(),
  }
});
```

### Reducer

```typescript
export const featureReducer = createReducer(
  initialState,
  on(FeatureActions.loadItems,        state => ({ ...state, loading: true, error: null })),
  on(FeatureActions.loadItemsSuccess, (state, { items }) => ({ ...state, items, loading: false })),
  on(FeatureActions.loadItemsFailure, (state, { error }) => ({ ...state, error, loading: false })),
);
```

### Effects

```typescript
loadItems$ = createEffect(() =>
  this.actions$.pipe(
    ofType(FeatureActions.loadItems),
    switchMap(() =>
      this.featureService.getAll().pipe(
        map(items => FeatureActions.loadItemsSuccess({ items })),
        catchError(err => of(FeatureActions.loadItemsFailure({ error: err.message })))
      )
    )
  )
);
```

### Selectors

```typescript
export const selectFeatureState = createFeatureSelector<FeatureState>('feature');

export const selectItems    = createSelector(selectFeatureState, s => s.items);
export const selectLoading  = createSelector(selectFeatureState, s => s.loading);
export const selectError    = createSelector(selectFeatureState, s => s.error);
export const selectSelected = createSelector(
  selectFeatureState,
  selectItems,
  (s, items) => items.find(i => i.id === s.selectedId) ?? null
);
```

### Facade (OBBLIGATORIA)

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureFacade {
  items$   = this.store.select(selectItems);
  loading$ = this.store.select(selectLoading);
  error$   = this.store.select(selectError);

  constructor(private store: Store) {}

  loadItems(): void   { this.store.dispatch(FeatureActions.loadItems()); }
  selectItem(id: string): void { this.store.dispatch(FeatureActions.selectItem({ id })); }
}
```

---

## Regole assolute

Non:
- chiamare `store.dispatch()` direttamente nei componenti — usa sempre la facade;
- chiamare API direttamente negli effects (usa solo i servizi di dominio);
- usare `any` come tipo nello stato o nelle azioni;
- usare `combineLatest` per semplice accesso a singole slice (usa selector combinato);
- dimenticare `loading: true` all'avvio di operazioni asincrone;
- dimenticare `error: null` quando si avvia una nuova operazione;
- lasciare effetti non testati;
- usare `tap` negli effects per side effect non urgenti (preferisci azioni aggiuntive).

---

## Integrazione con Signals (opzionale, consenso richiesto)

```typescript
// Solo se approvato
items = toSignal(this.facade.items$, { initialValue: [] });
loading = toSignal(this.facade.loading$, { initialValue: false });
```

---

## Criteri di completamento

Il lavoro è concluso solo dopo:
- store compilabile senza errori TypeScript;
- feature state isolato (non condivide slice con altri feature);
- `loading` e `error` gestiti in ogni operazione asincrona;
- facade esposta come unico punto di accesso;
- selectors testati con `MemoizedSelector`.

---

## Risposta attesa

```json
{
  "summary": "Store NgRx generato per feature '<nome>': N actions, reducer, effects, M selectors, facade.",
  "changedFiles": [
    "projects/generated-library/src/lib/store/<feature>.actions.ts",
    "projects/generated-library/src/lib/store/<feature>.reducer.ts",
    "projects/generated-library/src/lib/store/<feature>.effects.ts",
    "projects/generated-library/src/lib/store/<feature>.selectors.ts",
    "projects/generated-library/src/lib/store/<feature>.facade.ts"
  ],
  "commandsExecuted": ["ng build generated-library"],
  "errors": [],
  "artifacts": {
    "actions": 4,
    "selectors": 5,
    "facadeMethods": 3
  }
}
```
