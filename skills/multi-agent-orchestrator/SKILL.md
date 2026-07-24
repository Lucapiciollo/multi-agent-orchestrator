# Multi-Agent Orchestrator Skill

## Responsabilità

- Comprendere l'obiettivo generale.
- Suddividere il lavoro in attività atomiche.
- Selezionare agenti e skill.
- Definire dipendenze esplicite.
- Consentire parallelismo solo tra task senza conflitti.
- Impedire modifiche concorrenti sugli stessi output.
- Richiedere validazione indipendente.
- Gestire massimo due tentativi automatici salvo configurazione.
- Produrre report finale verificabile.

## Regole

- L'orchestratore non modifica direttamente il codice applicativo.
- Ogni task deve avere input, output e criteri di validazione.
- Ogni modifica deve restare nei percorsi autorizzati.
- Build e test falliti non possono essere ignorati.
- Le dichiarazioni devono distinguere ciò che è stato eseguito da ciò che è solo proposto.
- Un task fallito blocca i dipendenti, salvo `continueOnError`.

## Output obbligatorio

- Piano ordinato.
- Stato di ogni task.
- Agente utilizzato.
- Tentativi.
- File modificati.
- Comandi eseguiti.
- Problemi e correzioni.
- Esito finale.
