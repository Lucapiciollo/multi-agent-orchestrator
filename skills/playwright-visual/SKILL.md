# Playwright Visual

**Scopo**: Test visivo automatizzato su viewport multipli per verificare fidelità con il sorgente.

## Viewport da testare
320px, 375px, 414px, 768px, 1024px, 1280px, 1440px, 1920px

## Checklist test
- [ ] Nessun overflow orizzontale su nessun viewport
- [ ] Testo non tronca né sovrappone elementi
- [ ] Sidebar funziona su mobile (collapsible)
- [ ] Tabelle hanno scroll orizzontale se necessario
- [ ] Form layout corretto su mobile
- [ ] Dialog non esce dallo schermo

## Output
- `workspace/output/scss/screenshots/{viewport}.png` — screenshot di ogni viewport
- `workspace/output/angular/reports/visual-report.md` — diff e note

## Fix comuni responsive
| Problema | Fix |
|---|---|
| Card overflow | `min-width: 0` sul flex child |
| Testo overflow | `overflow-wrap: break-word` |
| Table mobile | `overflow-x: auto` sul wrapper |
| Dialog troppo largo | `max-width: 95vw` nel dialog.open() |
