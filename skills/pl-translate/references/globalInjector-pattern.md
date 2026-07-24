# Pattern globalInjector per traduzioni senza iniezione

## Contesto

`globalInjector` è un `Injector` Angular impostato una volta sola all'avvio dell'applicazione in `InitializerModule`. Permette di accedere ai servizi Angular da qualsiasi punto del codice, anche fuori da classi iniettabili.

## Import necessari

```typescript
import { globalInjector } from '@app/cloud/agic/core/module/initializer.tokens';
import { LanguageService } from '@app/cloud/agic/core/service/language.service';
```

## Pattern base (con try/catch obbligatorio)

```typescript
function translate(key: string): string {
   try {
      const lang = globalInjector?.get(LanguageService);
      return lang?.getTranslationText(key) ?? key;
   } catch {
      return key; // fallback al key stesso se globalInjector non disponibile
   }
}
```

> **IMPORTANTE**: il try/catch è obbligatorio. `globalInjector` può essere `undefined`
> durante il bootstrap dell'app (es. in unit test o SSR).

## Casi d'uso nell'applicazione

### 1. ConfigApp — YESNO_LABEL (esempio reale)
```typescript
// src/environments/config.ts
YESNO_LABEL: (flag: boolean): string => {
   try {
      const lang = globalInjector?.get(LanguageService);
      const code = lang?.currentLanguage?.()?.language ?? 'it-IT';
      const locale = code.split('-')[0].toLowerCase();
      const map: Record<string, [string, string]> = {
         it: ['Sì', 'No'], en: ['Yes', 'No'], de: ['Ja', 'Nein'],
      };
      const [yes, no] = map[locale] ?? map['it'];
      return flag ? yes : no;
   } catch { return flag ? 'Sì' : 'No'; }
},
```

### 2. NgRx selector con label dinamiche
```typescript
// src/app/.../selectors.ts
const getOptionsTraceable = () => [
   { id: 'SI', name: globalInjector?.get(LanguageService)?.getTranslationText('uuid-si') ?? 'Sì' },
   { id: 'NO', name: globalInjector?.get(LanguageService)?.getTranslationText('uuid-no') ?? 'No' },
];
```

### 3. Render hook in jx-cell column config
```typescript
// column-jx.ts
{
   name: 'refund',
   type: 'autocomplete',
   render: (v: string) => {
      try {
         const lang = globalInjector?.get(LanguageService);
         if (v === 'SI') return lang?.getTranslationText('uuid-si') ?? 'Sì';
         if (v === 'NO') return lang?.getTranslationText('uuid-no') ?? 'No';
         return v;
      } catch { return v; }
   }
}
```

### 4. Funzione utility standalone esportata
```typescript
// utils/labels.ts
export function getStatusLabel(status: string): string {
   try {
      return globalInjector?.get(LanguageService)?.getTranslationText(`uuid-status-${status}`) ?? status;
   } catch { return status; }
}
```

## Quando NON usare globalInjector

- In `@Component`, `@Injectable`, `@Pipe`: usa sempre l'iniezione classica nel costruttore
- In funzioni con `context` passato: usa `context.languageService`
- In guard/resolver Angular: usa `inject()` o iniezione costruttore

## Inizializzazione

`globalInjector` viene impostato in:
```typescript
// initializer.module.ts
export class InitializerModule implements DoBootstrap {
   constructor(private injector: Injector) {
      setGlobalInjector(injector); // ← qui viene inizializzato
   }
}
```
