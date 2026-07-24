# Regole di scansione testi statici

## Cosa scansionare

### File HTML (`.html`)

**INCLUDI:**
- Testo interpolato diretto tra tag: `<span>Testo</span>`, `<button>Label</button>`
- Attributi con valore stringa: `placeholder="..."`, `title="..."`, `alt="..."`
- Binding con stringa literal: `[matTooltip]="'Testo'"`, `[placeholder]="'Testo'"`
- `mat-label`, `mat-hint`, `mat-error` con contenuto fisso
- `aria-label="..."`, `aria-placeholder="..."`
- Testo in `<h1>`-`<h6>`, `<p>`, `<label>`, `<th>`, intestazioni di tabelle
- Testo in tag Angular Material: `mat-card-title`, `mat-card-subtitle`

**ESCLUDI:**
- Testi già tradotti (contengono UUID regex `/[0-9a-f]{8}-[0-9a-f]{4}-/i`)
- Testi in `{{ variabile }}` (non literal)
- Testi in commenti `<!-- -->`
- Binding che usano variabili: `[title]="myVar"`
- Testi tecnici: classi CSS, path, codici (`class="btn"`, `href="/path"`)
- Testi numerici puri: `"100"`, `"0"`
- Testi vuoti o solo spazi
- Template variables: `#myRef`

### File TypeScript (`.ts`)

**INCLUDI:**
- Stringhe in `title:`, `hint:`, `tipContent:`, `placeholder:` di config form
- Messaggi in `snackBar.open(...)`, `dialog.open(...)`, `alert(...)` che sono UI-facing
- Label in configurazioni colonne/tabelle: `title: 'Testo'`
- Messaggi di errore nei validator custom: `return { error: 'Messaggio' }`
- Testi in oggetti opzioni/combo: `name: 'Etichetta'`, `description: 'Testo'`
- Messaggi in `throw new Error('messaggio UI')`
- Stringhe in `tipContent:` dei form builder

**ESCLUDI:**
- Stringhe già con UUID (`/[0-9a-f]{8}-[0-9a-f]{4}-/i`)
- Stringhe in `console.log/warn/error` (messaggi di debug)
- Path e URL: `'/api/endpoint'`, `'assets/img/...'`
- Nomi di classi, metodi, variabili come stringhe
- Stringhe in `import` statements
- Chiavi di oggetti (non valori): `{ chiave: 'valore' }` → solo il valore
- Stringhe in file `*.spec.ts`
- Stringhe in `*.config.ts` che sono label tecniche (es. `'development'`)
- CSS class names: `'btn btn-primary'`
- Codici interni: `'SI'`, `'NO'`, `'PENDING'`, `'APPROVED'`
- Regular expression come stringhe

## Priorità di scansione

1. **Alta** — File HTML dei componenti (`.component.html`)
2. **Alta** — File di configurazione form (`form-build.ts`, `column.ts`, `column-jx.ts`)
3. **Media** — File dei componenti TypeScript (`.component.ts`)
4. **Media** — File servizi con messaggi UI (`.service.ts`)
5. **Bassa** — File utility e helper

## Pattern regex per identificare UUID già presenti

```regexp
/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i
```

Se un testo contiene già questo pattern, è già tradotto → non modificare.

## Deduplicazione

Testi identici devono condividere la **stessa chiave UUID**:
- Prima scansione completa del progetto
- Groupby testo → assegna 1 UUID per gruppo
- Sostituisce tutte le occorrenze con lo stesso UUID

## File esclusi dalla scansione

```
**/*.spec.ts
**/*.test.ts
**/node_modules/**
**/dist/**
**/.git/**
**/coverage/**
```
