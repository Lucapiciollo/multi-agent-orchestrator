# Angular Forms Migration

**Scopo**: Migrare form HTML a Angular Reactive Forms con pl-dynamicform quando appropriato.

## Quando usare pl-dynamicform
- Form con 3+ campi configurabili dinamicamente
- Form con COMBO (select con options da API/signal)
- Filter bar orizzontale

## Setup pl-dynamicform
```typescript
const config = DynamicFormBuilder.create({})
  .addGroup('', ['row', 'g-0'])
  .addForm({ formName: 'nome', title: 'Label', type: TYPE_CONTROL_FORM.TEXT,
    formControl: new FormControl(null), class: ['col-6'] })
  .build();
```

## Regole
1. `standalone: false` su tutti i componenti form
2. `ReactiveFormsModule` negli imports del NgModule
3. CHECKBOX da pl-dynamicform: `class[]` IGNORATO → usare `::ng-deep app-checkbox`
4. Filter bar: bottone Reset NATIVO come sibling di `<dynamic-form>` (non in addActions)
5. Datepicker toggle: aggiungere override CSS `.mat-mdc-icon-button { width: 28px !important; }`

## Fix altezza campi uniformi
```scss
::ng-deep dynamic-form app-date,
::ng-deep dynamic-form app-date-range {
  .mat-mdc-icon-button.mat-mdc-button-base { width: 28px !important; height: 28px !important; }
}
```
