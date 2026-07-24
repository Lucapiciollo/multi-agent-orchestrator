# Anti-breaking rules

La skill deve:

- creare file `.responsive.scss` separati;
- modificare gli SCSS esistenti solo con import finale;
- evitare `!important` salvo casi estremi;
- non modificare librerie condivise senza consenso;
- non applicare scroll alla pagina intera;
- non forzare tutto in colonna;
- non modificare TypeScript se il problema è solo visuale;
- indicare rollback sempre.

Rollback:

```txt
1. Eliminare il file `.responsive.scss`.
2. Rimuovere l'import dallo SCSS principale.
```
