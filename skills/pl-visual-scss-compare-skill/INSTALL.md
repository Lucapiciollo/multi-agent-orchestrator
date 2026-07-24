# Installazione — PL Visual SCSS Compare & Portal Parity Agent

## Uso in ChatGPT Skills

1. Apri ChatGPT.
2. Vai nella sezione Skills / GPT personalizzato.
3. Crea o modifica la skill.
4. Carica il contenuto di `SKILL.md` come istruzioni principali.
5. Aggiungi la cartella `references/` come materiale di riferimento.
6. Salva la skill con il nome:

```text
PL Visual SCSS Compare & Portal Parity Agent
```

## Uso con Codex / agente locale

Copia la cartella nel tuo workspace agenti:

```bash
pl-visual-scss-compare-skill/
  SKILL.md
  INSTALL.md
  manifest.json
  agents/openai.yaml
  references/
```

Poi usa `SKILL.md` come system/developer instruction dell'agente.

## Requisiti consigliati per confronto visuale

- Node.js >= 20
- Playwright >= 1.45
- TypeScript
- pixelmatch oppure resemblejs
- sharp oppure pngjs

Installazione minima per progetto di test:

```bash
npm init -y
npm i -D @playwright/test typescript ts-node pixelmatch pngjs sharp
npx playwright install
```

## Input minimi richiesti

Servono almeno:

```yaml
reference_url: "https://ambiente-riferimento"
current_url: "https://ambiente-attuale"
routes:
  - "/"
  - "/dashboard"
```

Se il portale richiede login, fornire credenziali o storage state Playwright.

## Output atteso

La skill deve produrre:

- report Markdown;
- report JSON;
- screenshot reference/current;
- immagini diff;
- elenco differenze SCSS/computed style;
- piano fix ordinato per severità.
