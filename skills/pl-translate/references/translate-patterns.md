# Pattern di traduzione HTML e TypeScript

## HTML — Template Angular

### Interpolazione di testo
```html
<!-- PRIMA (statico) -->
<span>Salva</span>

<!-- DOPO (tradotto) -->
<span>{{ 'a1b2c3d4-e5f6-4789-abcd-ef0123456789' | translateAsync }}</span>

<!-- DOPO con direttiva i18n (componenti con ng-deep o che già usano la direttiva) -->
<span i18n translateId="a1b2c3d4-e5f6-4789-abcd-ef0123456789">Salva</span>
```

### Attributi button/label
```html
<!-- PRIMA -->
<button>Conferma</button>
<mat-label>Nome utente</mat-label>

<!-- DOPO -->
<button>{{ 'uuid' | translateAsync }}</button>
<mat-label>{{ 'uuid' | translateAsync }}</mat-label>
```

### Attributi HTML
```html
<!-- PRIMA -->
<input placeholder="Inserisci valore">
<div [matTooltip]="'Informazioni aggiuntive'">

<!-- DOPO -->
<input [placeholder]="'uuid' | translateAsync">
<div [matTooltip]="'uuid' | translateAsync">

<!-- aria-label -->
<button [attr.aria-label]="'uuid' | translateAsync">
```

### mat-hint e mat-error
```html
<!-- PRIMA -->
<mat-hint>Massimo 100 caratteri</mat-hint>
<mat-error>Campo obbligatorio</mat-error>

<!-- DOPO -->
<mat-hint>{{ 'uuid' | translateAsync }}</mat-hint>
<mat-error>{{ 'uuid' | translateAsync }}</mat-error>
```

---

## TypeScript — Con contesto Angular (@Injectable, componente)

### Costruttore con LanguageService iniettato
```typescript
// PRIMA
this.snackBar.open('Operazione completata', 'Chiudi');

// DOPO
const msg = this.languageService.getTranslationText('uuid-operazione');
const close = this.languageService.getTranslationText('uuid-chiudi');
this.snackBar.open(msg, close);
```

### Configurazione form (con context passato)
```typescript
// PRIMA (in funzione createForm con context)
{
  title: 'Nome cliente',
  hint: 'Inserisci il nome',
}

// DOPO
{
  title: context.languageService.getTranslationText('uuid-nome-cliente'),
  hint: context.languageService.getTranslationText('uuid-inserisci-nome'),
}
```

### Costanti TR nel componente
```typescript
// Nel componente
readonly TR = {
  save: 'uuid-salva',
  cancel: 'uuid-annulla',
  title: 'uuid-titolo',
} as const;

// Nel template
{{ TR.save | translateAsync }}
<button [matTooltip]="TR.cancel | translateAsync">
```

---

## TypeScript — Senza contesto Angular (standalone, config, utils)

### Pattern globalInjector (per funzioni non iniettabili)
```typescript
import { globalInjector } from '@app/cloud/agic/core/module/initializer.tokens';
import { LanguageService } from '@app/cloud/agic/core/service/language.service';

// Funzione utility standalone
function getLabel(key: string): string {
   try {
      const lang = globalInjector?.get(LanguageService);
      return lang?.getTranslationText(key) ?? key;
   } catch {
      return key;
   }
}

// Uso in render hook jx-cell (non ha this)
{
   name: 'status',
   render: (v: string) => {
      try {
         const lang = globalInjector?.get(LanguageService);
         return lang?.getTranslationText(`uuid-status-${v}`) ?? v;
      } catch { return v; }
   }
}

// Uso in configurazione NgRx selector
const getOptions = () => [
   { id: 'SI', name: globalInjector?.get(LanguageService)?.getTranslationText('uuid-si') ?? 'Sì' },
   { id: 'NO', name: globalInjector?.get(LanguageService)?.getTranslationText('uuid-no') ?? 'No' },
];
```

### Quando usare globalInjector vs LanguageService iniettato

| Contesto | Pattern consigliato |
|---|---|
| `@Component`, `@Injectable`, `@Pipe` | `constructor(private ls: LanguageService)` |
| Funzione di configurazione con `context` | `context.languageService.getTranslationText()` |
| Funzione standalone senza inject | `globalInjector?.get(LanguageService)` |
| Render hook jx-cell | `globalInjector?.get(LanguageService)` |
| NgRx selector | `globalInjector?.get(LanguageService)` |
| Costante/utility fuori da classe | `globalInjector?.get(LanguageService)` |
