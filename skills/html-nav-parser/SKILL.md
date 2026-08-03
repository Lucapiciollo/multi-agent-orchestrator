# HTML Nav Parser

**Scopo**: Analizzare un file HTML e produrre il contratto di navigazione.

## Output
- `workspace/context/routing-map.json` — route dell'app (path, label, sezioni)
- `workspace/context/sections-map.json` — sezioni navigabili con HTML preview
- `workspace/context/app-config.json` — config globale (titolo, colori, font)

## Regole
1. Leggi il file HTML in `workspace/input/`
2. Identifica: `<nav>`, sidebar, menu, tab, breadcrumb, JS routing
3. Per ogni sezione: `{ id, name, type, htmlPreview (200 chars) }`
4. NON modificare il file sorgente
5. Se la navigazione è JS-driven (showSection, display:none switch), documentala come tab
