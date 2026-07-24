# TimeVision library profile

Questo file deve essere aggiornato dopo aver analizzato la libreria reference reale:

```txt
C:\Users\LucaPiciollo\Luca\TimeVision\src\frontend\TimeVision\projects\holidays
```

## Regole iniziali note

- Preferire Angular NgModule, non standalone.
- Generare librerie sotto `projects/<feature>`.
- Usare NgRx feature store locale.
- Ogni componente deve avere folder dedicata.
- Creare routing interno con index page.
- Non modificare app host.
- Usare librerie personali dove adatte.

## Da completare dopo analisi reale

- nomi moduli condivisi;
- import reali delle librerie personali;
- pattern facade esatto;
- pattern effects esatto;
- naming public-api;
- naming selectors;
- convenzioni CSS/SCSS.
