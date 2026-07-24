# Installazione - PL Prototype Angular Library Agent

## Dove copiare la skill

Copia la cartella:

```txt
pl-prototype-angular-library-agent/
```

nel workspace skill:

```txt
skills-workspace/skills/pl-prototype-angular-library-agent/
```

Esempio PowerShell:

```powershell
Expand-Archive .\pl-prototype-angular-library-agent.zip -DestinationPath .\
Copy-Item -Recurse .\pl-prototype-angular-library-agent "C:\Users\LucaPiciollo\OneDrive - AGIC\Desktop\skills-workspace\skills\pl-prototype-angular-library-agent"
```

Se il tuo workspace skill non ha la cartella `skills`, copiala direttamente dentro il workspace.

## Uso consigliato

```txt
Agisci come PL Prototype Angular Library Agent.

Trasforma questo prototipo HTML in una libreria Angular NgModule nel formato TimeVision.

Feature name: <nome-feature>
Target: projects/<nome-feature>

Regole:
- lavora solo dentro projects/<nome-feature>;
- ogni componente nella sua folder sotto components;
- crea index page con routing;
- crea NgRx completo;
- usa plDynamicForm, jx-cell e ux-design dove adatto;
- delega responsive e dark mode alle skill dedicate;
- non modificare file globali.
```

## Prima configurazione consigliata

Per massima precisione, fai analizzare alla skill la libreria reference:

```txt
C:\Users\LucaPiciollo\Luca\TimeVision\src\frontend\TimeVision\projects\holidays
```

Prompt:

```txt
Agisci come PL Prototype Angular Library Agent in modalità prototype:sync-timevision-format.
Analizza projects/holidays e crea il profilo TimeVision da usare per generare le prossime librerie.
```

## Validazione

Dopo la generazione, usa:

```txt
prototype:validate
```

La skill deve controllare che nessun file fuori da `projects/<feature>` sia stato modificato.
