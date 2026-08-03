# Workflow report: integrate-lib-to-webapp

**Obiettivo:** Integra la libreria Angular generata dal workflow precedente (in workspace/output/test-app/src/libs/) nella test-webapp come progetto Angular ufficiale (test-webapp/projects/lib-{name}/), aggiorna angular.json, tsconfig.json e verifica che la build sia pulita.
**Esito:** FALLITO
**Durata:** 174134 ms

## Task

### Scopre la lib generata nel workspace

- ID: `discover-generated-lib`
- Agente: `app-integrator-agent`
- Provider: `copilot` / Modello: `claude-sonnet-5`
- Skill: app-integrator, build-validator
- Stato: **failed**
- Tentativi: 2
- Riepilogo: Task bloccato: dipendenze angular-lib-agent e test-webapp-agent non hanno prodotto output nel percorso run-scoped workspace/runs/angular-responsive-golden-master/. Verificato: output/test-app/src/libs/ non esiste, output/angular/reports/architecture-report.md non esiste, output/test-app/ intero non esiste (solo output/angular/ presente). Il file lib-integration-plan.md risultava già presente (creato in un tentativo precedente) e documenta correttamente lo stato di blocco con i campi richiesti (nome lib atteso 'dashboard' da context/routing-map.json e selected-section.md, percorso sorgente atteso, percorso destinazione test-webapp/projects/dashboard/, package @app/dashboard, NgModule/selector N/D). Nessuna modifica applicata perché il contenuto esistente è già coerente e non ci sono nuovi dati reali da incorporare in assenza degli output di angular-lib-agent/test-webapp-agent.
- Errori: Percorso richiesto workspace/runs/angular-responsive-golden-master/output/test-app/src/libs/ non esiste: nessuna libreria generata da scoprire.; Input workspace/runs/angular-responsive-golden-master/output/angular/reports/architecture-report.md non esiste.; Impossibile leggere index.module.ts (nome NgModule e selector prefix non determinabili) perché il file sorgente non esiste.; Blocco: dipendenze angular-lib-agent e test-webapp-agent non hanno prodotto output nel percorso run-scoped richiesto (output/test-app/ è interamente assente).

### Copia la lib in test-webapp/projects/

- ID: `copy-lib-to-projects`
- Agente: `app-integrator-agent`
- Provider: `copilot` / Modello: `claude-sonnet-5`
- Skill: nessuna
- Stato: **blocked**
- Tentativi: 0
- Riepilogo: N/D
- Errori: Nessuno

### Registra la lib in angular.json e tsconfig

- ID: `register-in-angular-json`
- Agente: `app-integrator-agent`
- Provider: `copilot` / Modello: `claude-sonnet-5`
- Skill: nessuna
- Stato: **blocked**
- Tentativi: 0
- Riepilogo: N/D
- Errori: Nessuno

### Build della lib e verifica

- ID: `build-and-validate`
- Agente: `app-integrator-agent`
- Provider: `copilot` / Modello: `claude-sonnet-5`
- Skill: nessuna
- Stato: **blocked**
- Tentativi: 0
- Riepilogo: N/D
- Errori: Nessuno
