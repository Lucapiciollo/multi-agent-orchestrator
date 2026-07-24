# Angular library structure

La libreria generata deve stare sempre sotto:

```txt
projects/<feature-name>/
```

Struttura consigliata:

```txt
projects/<feature-name>/
├── src/
│   ├── lib/
│   │   ├── <feature-name>.module.ts
│   │   ├── routing/
│   │   ├── pages/
│   │   ├── containers/
│   │   ├── components/
│   │   ├── dialogs/
│   │   ├── adapters/
│   │   ├── config/
│   │   ├── models/
│   │   ├── services/
│   │   ├── store/
│   │   └── styles/
│   └── public-api.ts
├── ng-package.json
├── package.json
└── README.md
```

NgModule obbligatorio, non standalone.
