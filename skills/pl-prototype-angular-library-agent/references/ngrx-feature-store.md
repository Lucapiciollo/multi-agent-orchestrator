# NgRx feature store

Ogni feature library deve avere uno store locale:

```txt
store/
├── <feature>.actions.ts
├── <feature>.effects.ts
├── <feature>.facade.ts
├── <feature>.reducer.ts
├── <feature>.selectors.ts
└── <feature>.state.ts
```

Lo store deve essere registrato solo nel modulo della libreria:

```ts
StoreModule.forFeature(featureFeatureKey, featureReducer),
EffectsModule.forFeature([FeatureEffects])
```

Non modificare store globali.
