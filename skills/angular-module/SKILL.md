# Angular Module Scaffold

**Scopo**: Creare lo scheletro NgModule di una feature library Angular.

## Output (in `workspace/output/test-app/src/libs/{featureName}/`)
- `index.module.ts` — NgModule con imports Material/CDK/NgRx/PlDynForm
- `index-routing.module.ts` — route suggerite (per documentazione, NON importare nella lib)
- `index.guard.ts` — guard canActivate
- `index.models.ts` — interfacce TypeScript della feature
- `index.service.ts` — service con pattern InjectionToken + mock/BE switch

## Regole
1. `standalone: false` su tutti i componenti — NgModule non-standalone
2. `StoreModule.forFeature` + `EffectsModule.forFeature` SOLO nel StoreModule interno
3. La lib NON importa il proprio routing module
4. `HttpClientModule` negli imports del NgModule
5. Vedi angular-component-extractor §2 per struttura completa NgModule

## InjectionToken pattern (service)
```typescript
export const FEATURE_API_BASE_URL = new InjectionToken<string>('FEATURE_API_BASE_URL');
// ✅ MOCK (default) / 🔌 BACKEND (se token fornito dal consumer)
```
