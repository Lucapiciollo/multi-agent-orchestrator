# Installazione — PL Responsive Layout Intelligence Agent

## Dove metterla nel workspace skill

Copia questa cartella dentro il workspace delle skill:

```txt
skills-workspace/
└── pl-responsive-layout-agent/
    ├── SKILL.md
    ├── INSTALL.md
    ├── references/
    ├── scripts/
    └── agents/
```

Se nel tuo workspace hai una cartella `skills/`, usa:

```txt
skills-workspace/
└── skills/
    └── pl-responsive-layout-agent/
```

## Comando Windows PowerShell

Dalla cartella dove hai scaricato o estratto la skill:

```powershell
Copy-Item -Recurse .\pl-responsive-layout-agent C:\path\del\tuo\skills-workspace\skills\pl-responsive-layout-agent
```

Esempio:

```powershell
Copy-Item -Recurse .\pl-responsive-layout-agent "C:\Users\LucaPiciollo\OneDrive - AGIC\Desktop\skills-workspace\skills\pl-responsive-layout-agent"
```

## Comando Git Bash / Linux / macOS

```bash
cp -R ./pl-responsive-layout-agent /path/del/tuo/skills-workspace/skills/pl-responsive-layout-agent
```

## Come usarla in un progetto Angular

Prompt consigliato:

```txt
Agisci come PL Responsive Layout Intelligence Agent.
Analizza questa pagina Angular componente per componente.
Voglio patch responsive non distruttive.
Non modificare gli SCSS esistenti salvo import finale.
Crea file `.responsive.scss` dedicati.
Usa Flexbox dove possibile.
Usa Grid solo se serve struttura.
Usa scroll orizzontale controllato per tabelle, planner, calendari e componenti complessi.
Non modificare librerie condivise senza consenso.
Fornisci file completi e rollback.
```

## Dipendenze opzionali per audit visuale

Nel progetto da testare puoi installare Playwright:

```bash
npm i -D playwright
npx playwright install chromium
```

Poi puoi lanciare:

```bash
node scripts/responsive-audit.mjs http://localhost:4200
```

oppure, se lo script è dentro il workspace skill:

```bash
node path/to/pl-responsive-layout-agent/scripts/responsive-audit.mjs http://localhost:4200
```
