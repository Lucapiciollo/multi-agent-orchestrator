# Installazione - PL Enterprise Dark Mode & Theme Automation Agent

## Contenuto pacchetto

```text
pl-enterprise-dark-mode-theme-agent/
  SKILL.md
  INSTALL.md
  manifest.json
  agents/
    openai.yaml
  references/
    dark-mode-implementation-playbook.md
    playwright-dark-mode-audit.md
    wcag-contrast-checklist.md
    anti-breaking-rules.md
    report-template.md
  assets/
```

## Uso in ChatGPT Skills

1. Apri ChatGPT.
2. Vai nella sezione Skills / GPT personalizzati se disponibile.
3. Crea una nuova skill.
4. Carica il contenuto di `SKILL.md` come istruzioni principali.
5. Aggiungi i file in `references/` come documentazione di supporto.
6. Usa il nome:

```text
PL Enterprise Dark Mode & Theme Automation Agent
```

## Uso con Codex / agente locale

1. Estrai lo ZIP nel workspace agenti.
2. Copia `SKILL.md` nelle istruzioni dell'agente.
3. Copia `agents/openai.yaml` dove previsto dal tuo runner.
4. Tieni i playbook in `references/` disponibili al modello.

## Requisiti consigliati nel progetto target

- Node.js compatibile con il progetto.
- Angular CLI.
- Playwright installabile o già presente.
- Repository Git con working tree pulito.
- Accesso alle rotte principali del portale.

## Comando consigliato per audit Playwright

La skill può generare script specifici per il progetto. Come base:

```bash
npm install -D @playwright/test
npx playwright install
```

## Regola importante

La skill non deve modificare librerie condivise senza consenso esplicito.
