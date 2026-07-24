# Regole anti-rottura — pl-translate

## Prima di qualsiasi modifica

1. **Verifica che il progetto compili** — Non applicare se ci sono errori esistenti
2. **Verifica che i file XLF siano validi** — XML corretto prima e dopo
3. **Non modificare UUID esistenti** — Solo aggiunta, mai modifica o rimozione
4. **Non cambiare il contenuto di `<source>`** — Solo `<target>` può cambiare

## Regole sui file XLF

- NON rimuovere entry esistenti
- NON modificare `state="final"` di entry già presenti
- NON cambiare l'UUID di una entry esistente
- AGGIUNGERE solo in fondo, prima di `</body>`
- VERIFICARE che l'UUID sia presente in TUTTI i file XLF configurati

## Regole sul codice TypeScript

- NON cambiare la logica — solo la stringa hardcoded diventa una chiamata al LS
- NON aggiungere import se `globalInjector` non è già configurato nell'app
- SEMPRE wrappare `globalInjector.get()` in try/catch
- FALLBACK sicuro: se la traduzione non è disponibile, mostrare il testo originale

## Regole sul template HTML

- NON cambiare la struttura del template — solo il contenuto/attributo
- USARE `translateAsync` pipe (non `translate` sincrona)
- PREFERIRE la pipe a `{{ }}` rispetto alla direttiva `i18n` per semplicità
- VERIFICARE che la pipe `translateAsync` sia disponibile nel modulo del componente

## Modalità audit

In modalità audit la skill NON deve:
- Modificare alcun file del progetto target
- Creare file nel progetto target
- Eseguire operazioni di scrittura

Può SOLO:
- Leggere file
- Analizzare testi
- Produrre report in `skills/pl-translate/outputs/reports/`

## Rollback

Tutte le modifiche applicate sono tracciate nel report apply.
Per fare rollback: usare `git diff` e `git checkout` sui file modificati.
