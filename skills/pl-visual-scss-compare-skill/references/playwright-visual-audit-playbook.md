# Playwright Visual Audit Playbook

## Sequenza consigliata

1. Configura due browser context separati: reference e current.
2. Imposta stesso viewport, timezone, locale, reduced motion e device scale factor.
3. Esegui login o carica storage state.
4. Naviga ogni route in entrambi gli ambienti.
5. Attendi network idle e app-root visibile.
6. Disabilita animazioni per misurazioni statiche.
7. Cattura screenshot full-page e viewport.
8. Cattura snapshot DOM/computed style per selector map.
9. Confronta pixel, bounding box e computed style.
10. Genera report JSON e Markdown.

## Selector map esempio

```json
{
  "pageShell": "[data-testid='page-shell']",
  "header": "[data-testid='page-header']",
  "sidebar": "[data-testid='main-sidebar']",
  "content": "[data-testid='page-content']",
  "title": "h1, .page-title",
  "primaryButton": "button[type='submit'], .mat-mdc-raised-button",
  "formFields": ".mat-mdc-form-field",
  "table": "table, .mat-mdc-table"
}
```

## Differenze da non ignorare

- font-size e line-height;
- gap e padding;
- centro matematico di card, modali e bottoni;
- altezza input Material;
- allineamento icona/testo;
- larghezza container;
- breakpoint responsive.


## Modalità strict 1000/1000

Per confronti critici eseguire sempre due passaggi:

1. **Static/stabilized run**: animazioni disabilitate, reduced motion, fonts ready, network idle.
2. **State/interaction run**: stati hover/focus/menu/dialog/table expanded confrontati uno per volta.

Regole:

- eseguire almeno 2 screenshot per route/viewport;
- confrontare pixel diff solo dopo aver mascherato contenuti dinamici;
- salvare snapshot JSON con computed style e bounding box;
- considerare reale una differenza solo se pixel diff + DOM/CSS/geometry concordano;
- allegare nel report screenshot reference/current/diff e tabella dei delta.

## Checklist anti-falsi positivi

Prima di aprire un bug verificare:

- font caricati in entrambi gli ambienti;
- assenza di richieste fallite per CSS/font/icon/images;
- stesso zoom e devicePixelRatio;
- stesso utente/ruolo/dati mock quando possibile;
- scroll position uguale;
- viewport uguale;
- nessun loader/skeleton visibile;
- nessun banner cookie o popover aperto in uno solo dei due ambienti.
