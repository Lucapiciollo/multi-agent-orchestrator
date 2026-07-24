# Workspace Output Policy

Questa skill opera in modalità **workspace-safe**.

## Regola principale
La skill non deve creare script, audit, screenshot, report, patch temporanee o file di supporto dentro il progetto target.

Gli artefatti devono essere salvati solo nella cartella della skill:

- `scripts/`
- `outputs/`
- `outputs/reports/`
- `outputs/screenshots/`
- `outputs/patches/`
- `outputs/logs/`
- `.tmp/`

## Variabili standard

- `PL_SKILL_ID`: id della skill
- `PL_WORKSPACE_ROOT`: root del workspace skill
- `PL_SKILL_PATH`: cartella della skill
- `PL_TARGET_PROJECT_PATH`: progetto da analizzare/modificare
- `PL_OUTPUT_PATH`: output locale della skill
- `PL_TEMP_PATH`: temporanei locali della skill

## Progetto target
Il progetto target può essere letto liberamente per audit e analisi.
Può essere modificato solo quando l'utente lo chiede esplicitamente o approva il piano.

## Divieti
Nel progetto target non creare cartelle tipo:

- `scripts/`
- `reports/`
- `audits/`
- `screenshots/`
- `visual-diff/`
- `.tmp/`
- `generated/`
- `ai-output/`
- `skill-output/`
