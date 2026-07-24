---
name: pl-translate
description: Scansiona il codice Angular alla ricerca di testi statici hardcoded (template HTML, TypeScript, SCSS) e applica il sistema di traduzione già in essere nell'applicazione (file XLF + pipe translateAsync + direttiva i18n + LanguageService). Genera chiavi UUID univoche, aggiorna i file XLF per tutte le lingue configurate e sostituisce i testi statici con i riferimenti corretti. Controlla e corregge errori di punteggiatura, accenti e ortografia nei testi tradotti e hardcoded. Opera in modalità audit (solo report), apply (applica le modifiche), check (verifica coerenza) o spell (controllo ortografico e punteggiatura).
---

# PL Translate — Static Text to i18n Agent

## Obiettivo

Automatizzare la migrazione di testi statici hardcoded in Angular verso il sistema di traduzione dell'applicazione, garantendo coerenza con l'architettura già in essere.

La skill opera su tre livelli:
1. **Scansione** — individua tutti i testi statici nei file HTML/TS/SCSS del progetto target
2. **Generazione** — crea chiavi UUID univoche per ogni testo nuovo
3. **Applicazione** — aggiorna i file XLF e sostituisce i testi nel sorgente

---

## Sistema di traduzione supportato

La skill è progettata per il sistema di traduzione PL Enterprise:

### File XLF
- Percorso: `src/locale/private.messages.{lang}.xlf`
- Lingue configurate: `it`, `en`, `de` (estendibile)
- Formato entry:
  ```xml
  <trans-unit id="UUID"><source>Testo originale</source><target state="final">Traduzione</target></trans-unit>
  ```

### Template Angular (HTML)
```html
<!-- Pipe translateAsync (uso standard) -->
{{ 'uuid-chiave' | translateAsync }}

<!-- Direttiva i18n con attributo translateId (componenti con ng-deep) -->
<span i18n translateId="uuid-chiave">Testo originale</span>

<!-- Attributi HTML con pipe -->
[matTooltip]="'uuid-chiave' | translateAsync"
[placeholder]="'uuid-chiave' | translateAsync"
[attr.aria-label]="'uuid-chiave' | translateAsync"
```

### TypeScript — Con contesto di iniezione (componenti, servizi)
```typescript
// Via LanguageService iniettato
this.languageService.getTranslationText('uuid-chiave')

// Via costante TR nel componente
readonly TR = { miaChiave: 'uuid-chiave' };
// Template: {{ TR.miaChiave | translateAsync }}

// Via context (in funzioni di configurazione form/griglia)
context.languageService.getTranslationText('uuid-chiave')
```

### TypeScript — Senza contesto di iniezione (funzioni standalone, config, utils)

Quando il codice si trova in funzioni che **non possono iniettare dipendenze** (funzioni di configurazione pure, utility, YESNO_LABEL, render hooks), si usa `globalInjector`:

```typescript
import { globalInjector } from '@app/cloud/agic/core/module/initializer.tokens';
import { LanguageService } from '@app/cloud/agic/core/service/language.service';

// Pattern sicuro con try/catch (il globalInjector può non essere disponibile a runtime)
function getTranslatedText(key: string): string {
   try {
      const lang = globalInjector?.get(LanguageService);
      return lang?.getTranslationText(key) ?? key;
   } catch {
      return key; // fallback al key stesso
   }
}
```

**Casi d'uso tipici per globalInjector:**
- Funzioni `render?` in colonne jx-cell (non hanno `this`)
- Costanti configurate fuori da classi Angular (`ConfigApp`, `getOptions*`)
- Selectors NgRx con label dinamiche
- Utility functions esportate standalone

**Import necessari:**
```typescript
import { globalInjector } from '@app/cloud/agic/core/module/initializer.tokens';
import { LanguageService } from '@app/cloud/agic/core/service/language.service';
```

---

## Modalità operative

### `audit` — Solo analisi (non modifica nulla)
Produce un report con:
- Lista di testi statici trovati
- File e riga di ogni occorrenza
- Stima dell'impatto (quanti file, quante chiavi nuove)
- Chiavi già presenti nei file XLF (riutilizzabili)

### `apply` — Applica le modifiche
1. Genera UUID per ogni testo nuovo
2. Aggiunge le entry nei file XLF (tutte le lingue)
3. Sostituisce i testi statici nel sorgente
4. Produce un report delle modifiche applicate

### `check` — Verifica coerenza
Controlla che:
- Tutte le chiavi usate nel codice esistano nei file XLF
- Non ci siano chiavi orfane (nei XLF ma non usate nel codice)
- Tutte le lingue abbiano la stessa chiave

### `spell` — Controllo punteggiatura e ortografia
Analizza i valori `<target>` nei file XLF e i testi hardcoded trovati nel codice per individuare:

**Errori di accento (italiano):**
- `e'` → `è`, `e'` → `è`
- `a'` → `à`, `o'` → `ò`, `u'` → `ù`, `i'` → `ì`
- Apostrofi usati al posto di accenti: `perche'` → `perché`, `cioe'` → `cioè`
- Uso errato di accento grave vs acuto: `perchè` → `perché`, `affinchè` → `affinché`

**Errori di punteggiatura:**
- Spazio prima di `?`, `!`, `:`, `;` → rimuovere
- Assenza di spazio dopo `.`, `,`, `?`, `!`, `:`, `;`
- Doppio spazio tra parole
- Virgolette dritte `"testo"` → usare le stesse convenzioni del progetto
- Puntini di sospensione `...` → opzionalmente `…` (Unicode)
- Maiuscola inizio frase mancante dopo `.`

**Errori ortografici comuni (italiano):**
- Apostrofo errato in `un'` / `un` (discrimina maschile/femminile)
- `qual'è` → `qual è` (nessun apostrofo)
- `po'` vs `pò` → corretto è `po'`

**Output del controllo spell:**
```markdown
### {percorso/file o chiave XLF}
| Riga/ID | Testo attuale | Errore | Correzione suggerita | Auto-fix |
|---------|---------------|--------|----------------------|---------|
| 42 | "Inserisci l'eta'" | accento | "Inserisci l'età" | ✓ |
| xlf:abc-123 | "Salva e chiudi ?" | punteggiatura | "Salva e chiudi?" | ✓ |
```

**Modalità auto-fix:** applica le correzioni con `auto-fix: true` solo per regole deterministiche (accenti, spazi prima di punteggiatura). Le correzioni ortografiche ambigue richiedono conferma esplicita.

---

## Regole operative

### Cosa scansionare

**HTML — priorità alta:**
- Testo interpolato diretto: `{{ 'stringa' }}` dove la stringa non è una variabile
- Attributi `placeholder`, `title`, `alt`, `aria-label` con valori statici
- Contenuto di `<button>`, `<label>`, `<span>`, `<p>`, `<h1>`-`<h6>` con testo fisso
- `mat-label`, `mat-hint`, `mat-error` con testo fisso
- `[matTooltip]="'testo'"` (stringa literal)

**TypeScript — priorità alta:**
- `console.log`, `console.error` con messaggi UI-facing (escludere messaggi di debug interni)
- Messaggi in `this.snackBar.open(...)`, `this.dialog.open(...)` con testo statico
- Label in configurazioni di form (`title`, `placeholder`, `hint`, `tipContent`)
- Messaggi di errore in validator personalizzati

**Cosa NON scansionare:**
- Commenti nel codice
- URL e path di file
- Nomi di classi CSS, variabili, funzioni
- Codici interni (ID, chiavi, slug)
- Testi già tradotti (contengono un UUID valido)
- Testi in file `*.spec.ts` (test)
- Testi in file `*.config.ts` che sono label tecniche

### Pattern per riconoscere testi già tradotti
```regexp
/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
```

### Generazione UUID
- Usa UUID v4 (`crypto.randomUUID()` o equivalente)
- Formato: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- Una chiave per testo UNICO (testi identici condividono la stessa chiave)

---

## Output prodotti

### Report audit (`outputs/reports/translate-audit-{data}.md`)
```markdown
# Translate Audit — {progetto} — {data}

## Sommario
- File scansionati: N
- Testi statici trovati: N
- Chiavi nuove da generare: N
- Chiavi riutilizzabili (già in XLF): N

## Testi trovati

### {percorso/file.html}
| Riga | Testo | Tipo | Chiave esistente |
|------|-------|------|-----------------|
| 42 | "Salva" | button-content | - |
| 87 | "Inserisci il valore" | placeholder | - |
```

### Patch XLF (`outputs/patches/translate-{lang}-{data}.patch`)
Diff delle modifiche ai file XLF.

### Report apply (`outputs/reports/translate-apply-{data}.md`)
Lista di tutte le sostituzioni effettuate con riferimento al commit.

---

## Workflow raccomandato

```
1. audit   → verifica cosa sarà modificato
2. review  → l'utente approva/esclude testi
3. apply   → applica le modifiche
4. spell   → controlla punteggiatura, accenti e ortografia (sui testi XLF e hardcoded)
5. check   → verifica la coerenza finale
```

> Il passo `spell` può essere eseguito indipendentemente in qualsiasi momento, anche senza passare per audit/apply.

---

## Regole anti-rottura

1. **Non modificare** file fuori dal progetto target
2. **Non rimuovere** chiavi esistenti dai file XLF
3. **Non sovrascrivere** traduzioni esistenti per altre lingue
4. **Preservare** la formattazione originale del file (indentazione, newline)
5. **Backup** implicito: tutte le modifiche sono tracciate nel report apply
6. **Nessuna modifica** se il testo è già tradotto (contiene UUID)
7. **Conferma esplicita** prima di applicare in modalità apply

---

## PL AI Skills Factory - Workspace Output Policy

La skill deve generare script, report, screenshot, audit e file temporanei solo dentro la propria cartella del workspace (`skills/pl-translate/outputs/`), mai dentro il progetto target.
