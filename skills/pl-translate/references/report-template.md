# Report Template — pl-translate

## Audit Report

```markdown
# Translate Audit — {progetto} — {data YYYY-MM-DD}

## Sommario
- File scansionati: N
- Testi statici trovati: N
- Chiavi nuove da generare: N
- Testi già tradotti (ignorati): N
- File XLF da aggiornare: it, en, de

## Testi trovati per file

### src/app/component/my.component.html
| Riga | Testo | Tipo | Chiave esistente |
|------|-------|------|-----------------|
| 12 | "Salva" | button-content | - |
| 45 | "Inserisci il nome" | placeholder | - |
| 78 | "Campo obbligatorio" | mat-error | - |

### src/app/service/my.service.ts
| Riga | Testo | Tipo | Chiave esistente |
|------|-------|------|-----------------|
| 34 | "Operazione completata" | snackbar-message | - |
| 89 | "Errore durante il salvataggio" | error-message | - |

## Testi deduplicati
- "Salva" appare in 5 file → 1 UUID condiviso
- "Annulla" appare in 3 file → 1 UUID condiviso

## Azioni richieste
- [ ] Generare N UUID nuove
- [ ] Aggiornare 3 file XLF
- [ ] Modificare N file sorgente
```

## Apply Report

```markdown
# Translate Apply — {progetto} — {data YYYY-MM-DD}

## Sommario
- UUID generate: N
- File XLF aggiornati: 3
- File sorgente modificati: N
- Entry aggiunte per lingua: N

## UUID generate

| UUID | Testo IT | Testo EN | Testo DE |
|------|----------|----------|----------|
| a1b2c3d4-... | Salva | Save | Speichern |
| b2c3d4e5-... | Annulla | Cancel | Abbrechen |

## Modifiche ai file sorgente

### src/app/component/my.component.html
- Riga 12: `Salva` → `{{ 'a1b2c3d4-...' | translateAsync }}`
- Riga 45: `placeholder="Inserisci"` → `[placeholder]="'b2c3...' | translateAsync"`

### src/app/service/my.service.ts
- Riga 34: `'Operazione completata'` → `this.languageService.getTranslationText('c3d4...')`

## Commit suggerito
`feat(i18n): migrazione testi statici a translateAsync (#ticket)`
```

## Check Report

```markdown
# Translate Check — {progetto} — {data YYYY-MM-DD}

## Sommario
- Chiavi nel codice: N
- Chiavi nei file XLF: N
- Chiavi mancanti in XLF: N (ERRORE se > 0)
- Chiavi orfane in XLF: N (WARNING se > 0)
- Lingue incomplete: N (ERRORE se > 0)

## Errori — Chiavi mancanti in XLF
| UUID | Usata in | File XLF mancante |
|------|----------|------------------|
| abc-123 | my.component.html:45 | it, de |

## Warning — Chiavi orfane
| UUID | Presente in XLF | Non trovata nel codice |
|------|----------------|----------------------|
| xyz-789 | it, en, de | - |
```
