# Multi-Agent Orchestrator

Workspace TypeScript per orchestrare agenti specializzati tramite skill Markdown e workflow JSON.

## Funzioni

- registry degli agenti;
- skill caricabili da `skills/<id>/SKILL.md`;
- pianificazione a dipendenze;
- esecuzione parallela controllata;
- blocco dei conflitti sui percorsi;
- provider intercambiabili;
- validazione indipendente;
- retry con feedback;
- report JSON e Markdown;
- checkpoint Git opzionali;
- CLI.

## Requisiti

- Node.js 20 o superiore
- npm

## Installazione

```bash
npm install
cp .env.example .env
```

Su Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Prima esecuzione

Il provider predefinito è `mock`, quindi puoi provare subito:

```bash
npm run demo
```

Comandi disponibili:

```bash
npm run list:agents
npm run list:skills
npm run demo
npm run dev -- validate workflows/demo.workflow.json
npm run dev -- run workflows/html-to-angular.workflow.json
```

## Provider CLI reale

Imposta nel file `.env`:

```env
AGENT_PROVIDER=cli
AGENT_CLI_COMMAND=nome-del-tuo-agent-cli
AGENT_CLI_ARGS=run,--stdin
```

Il provider invia il prompt su `stdin` e si aspetta su `stdout` un JSON con questa forma:

```json
{
  "summary": "Attività completata",
  "changedFiles": [],
  "commandsExecuted": [],
  "errors": [],
  "artifacts": {}
}
```

Se il programma restituisce testo non JSON, l'orchestratore lo inserisce comunque nel riepilogo.

## Creare un agente

Aggiungi un record in:

```text
agents/registry.json
```

Ogni agente dichiara:

- skill;
- tag;
- capacità;
- percorsi consentiti;
- percorsi vietati;
- priorità.

## Creare una skill

Crea:

```text
skills/<skill-id>/SKILL.md
```

e registrala in:

```text
skills/registry.json
```

## Creare un workflow

Copia uno dei file in `workflows/` e modifica:

- `objective`;
- `projectRoot`;
- `tasks`;
- dipendenze;
- agenti;
- skill;
- input/output;
- criteri di validazione.

## Sicurezza operativa

Il sistema verifica i percorsi dichiarati, impedisce task concorrenti sugli stessi output e limita i tentativi automatici. Per un ambiente reale aggiungi sandbox, container e policy di comandi consentiti.
