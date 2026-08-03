# CSS Extractor

**Scopo**: Estrarre tutto il CSS/SCSS da un file HTML o CSS.

## Output
- `workspace/output/scss/source-original.html` — copia intatta del sorgente
- `workspace/output/scss/raw.css` — CSS estratto (tutti i blocchi `<style>`)
- `workspace/output/scss/reports/inventory.md` — inventario: blocchi style, classi usate, custom props

## Regole
1. Copia byte-per-byte il file HTML in `source-original.html`
2. Estrai tutti i blocchi `<style>` e gli stili inline significativi
3. Conta: classi uniche, custom properties `:root`, media query, keyframes
4. NON compilare o trasformare il CSS in questo step — solo estrazione
