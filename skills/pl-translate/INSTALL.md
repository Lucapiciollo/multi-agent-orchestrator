# INSTALL — pl-translate

## Prerequisiti

- Node.js ≥ 18
- Progetto Angular con sistema di traduzione PL Enterprise
- File XLF in `src/locale/private.messages.{it,en,de}.xlf`
- `LanguageService` disponibile nell'applicazione
- `globalInjector` configurato in `initializer.module.ts`

## Setup

Nessuna installazione necessaria. La skill opera direttamente sui file del progetto target tramite VS Code + GitHub Copilot.

## Utilizzo da task VS Code

```bash
# Audit (solo analisi)
powershell -ExecutionPolicy Bypass -File ./tools/run-skill.ps1 \
  -SkillId pl-translate \
  -TargetProject C:/path/to/project \
  -Mode audit

# Apply (applica le modifiche)
powershell -ExecutionPolicy Bypass -File ./tools/run-skill.ps1 \
  -SkillId pl-translate \
  -TargetProject C:/path/to/project \
  -Mode apply

# Check (verifica coerenza XLF)
powershell -ExecutionPolicy Bypass -File ./tools/run-skill.ps1 \
  -SkillId pl-translate \
  -TargetProject C:/path/to/project \
  -Mode check
```

## Configurazione lingue

Di default la skill gestisce: `it`, `en`, `de`.

Per aggiungere lingue, indicarle nella richiesta:
```
"Aggiungi anche il francese (fr)"
```

## File di output

Tutti gli output vengono salvati in:
```
skills/pl-translate/outputs/reports/
skills/pl-translate/outputs/patches/
```
