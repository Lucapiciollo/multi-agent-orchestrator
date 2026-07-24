# SCSS Diff Checklist

## File da controllare

- angular.json styles array
- src/styles.scss
- src/styles/**/*.scss
- projects/**/src/**/*.scss
- theme Material
- tokens CSS/SCSS
- typography config
- density config
- component overrides

## Cause tipiche di differenza visuale

- ordine import diverso;
- tema Material non incluso;
- CSS variable mancante;
- versione diversa di una libreria;
- font non caricato;
- density Material diversa;
- reset CSS differente;
- specificità più alta in un ambiente;
- media query diversa;
- shadow DOM/encapsulation differente;
- assets o CDN non raggiungibili.

## Regola fix

Prima correggere token e tema globale. Solo dopo intervenire sui singoli componenti.


## Fix sicuri e non distruttivi

Prima di correggere:

- localizzare il token o import responsabile;
- controllare `angular.json` e ordine degli style globali;
- controllare versioni npm e lockfile;
- verificare se la differenza nasce da una libreria condivisa;
- preferire override locali o adapter se la libreria non può essere modificata.

Non fare:

- refactoring architetturali per un problema SCSS;
- override globali aggressivi;
- modifiche massive ai componenti Material;
- hard-code di valori se esistono token;
- modifica delle librerie di Luca senza consenso.

Ogni soluzione deve avere:

- file preciso;
- patch minima;
- rischio stimato;
- comando verifica;
- comando rollback.
