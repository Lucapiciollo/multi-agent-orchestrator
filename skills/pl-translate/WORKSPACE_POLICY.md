# WORKSPACE_POLICY — pl-translate

## Regola fondamentale

Tutti gli output della skill (report, patch, log, file temporanei) devono essere scritti **esclusivamente** nelle cartelle interne alla skill:

```
skills/pl-translate/outputs/reports/
skills/pl-translate/outputs/patches/
skills/pl-translate/outputs/screenshots/
skills/pl-translate/outputs/logs/
skills/pl-translate/.tmp/
```

## Il progetto target NON deve ricevere:
- Script di analisi
- File di report o audit
- Cartelle temporanee
- File di configurazione della skill

## Il progetto target RICEVE SOLO (in modalità apply):
- Modifiche ai file `.xlf` (aggiunta entry)
- Sostituzioni di testo statico con chiavi UUID nei file `.html` e `.ts`

## Sicurezza

- La skill non elimina mai entry esistenti dai file XLF
- La skill non sovrascrive traduzioni già presenti
- In modalità `audit` non modifica nulla nel progetto target
- Ogni modifica è tracciata nel report apply
