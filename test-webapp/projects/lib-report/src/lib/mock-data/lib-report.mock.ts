import {
  CascadingClient,
  ReportCategory,
  SavedReport,
  StoricoRecord,
} from '../index.models';

export const REPORT_CATEGORIES_MOCK: ReportCategory[] = [
  {
    catId: 'timesheet', label: 'Periodo Timesheet', icon: 'schedule',
    subSections: [{
      subId: 'ts-corrente', catId: 'timesheet', label: 'Periodo Corrente',
      presets: [
        { label: 'Timesheet aperti del periodo corrente', description: 'Periodi ancora in stato Aperto' },
        { label: 'Ore totali per commessa',               description: 'Ore del mese precedente per commessa' },
        { label: 'Note spese del periodo',                description: 'Tutte le note spese del periodo' },
      ],
      filters: [
        { id: 'periodo',      type: 'periodo',           label: 'Periodo' },
        { id: 'stato',        type: 'multiselect',       label: 'Stato', dependsOn: 'periodo',
          options: ['Aperto','In approvazione','Approvato','In errore','Elaborato','Stornato'].map(v => ({ value: v.toLowerCase().replace(/ /g,'-'), label: v })) },
        { id: 'nome_cognome', type: 'text', label: 'Nome/Cognome' },
        { id: 'gruppo',       type: 'text', label: 'Gruppo' },
        { id: 'gruppo_sec',   type: 'text', label: 'Gruppo secondario' },
        { id: 'cliente',      type: 'cascade-cliente',  label: 'Cliente' },
        { id: 'commessa',     type: 'cascade-commessa', label: 'Commessa', dependsOn: 'cliente' },
        { id: 'task',         type: 'cascade-task',     label: 'Task',     dependsOn: 'commessa' },
      ],
      fieldGroups: [
        { key: 'timesheet',   label: 'Timesheet',   fields: [{id:'risorsa',label:'Risorsa'},{id:'periodo',label:'Periodo'},{id:'stato',label:'Stato'},{id:'cliente',label:'Cliente'},{id:'commessa',label:'Commessa'},{id:'task',label:'Task'},{id:'ore_giorno',label:'Ore per giorno'},{id:'totale_ore',label:'Totale ore'},{id:'ore_ordinarie',label:'Ore ordinarie'}] },
        { key: 'annotazioni', label: 'Annotazioni', fields: [{id:'ann_data',label:'Data'},{id:'ann_commessa',label:'Cliente / Commessa / Task'},{id:'ann_ore',label:'Ore'},{id:'ann_note',label:'Note'},{id:'ann_presso',label:'Presso cliente'}] },
        { key: 'nota-spese',  label: 'Nota spese',  fields: [{id:'ns_data',label:'Data'},{id:'ns_commessa',label:'Cliente / Commessa / Task'},{id:'ns_causale',label:'Causale'},{id:'ns_descr',label:'Descrizione'},{id:'ns_doc_rif',label:'Documento di riferimento'},{id:'ns_qty',label:'Quantità'},{id:'ns_importo',label:'Importo riga'},{id:'ns_um',label:'Unità di misura'},{id:'ns_costo',label:'Costo unitario'},{id:'ns_rimborso',label:'Rimborso'},{id:'ns_tracciabile',label:'Tracciabile'}] },
      ],
    }],
  },
  {
    catId: 'gestione', label: 'Gestione Periodo', icon: 'event_repeat',
    subSections: [
      {
        subId: 'gestione-controllo', catId: 'gestione', label: 'Controllo',
        presets: [
          { label: 'Periodi aperti nel mese corrente', description: 'Risorse con periodo ancora aperto' },
          { label: 'Riepilogo CHG annuale',            description: "CHG per tutte le risorse nell'anno" },
        ],
        filters: [
          { id: 'anno',        type: 'select', label: 'Anno', options: [{value:'2024',label:'2024'},{value:'2025',label:'2025'},{value:'2026',label:'2026'}] },
          { id: 'nome_cognome', type: 'text',  label: 'Nome/Cognome' },
          { id: 'gruppo',       type: 'text',  label: 'Gruppo' },
        ],
        fieldGroups: [
          { key: 'risorsa',     label: 'Risorsa',      fields: [{id:'risorsa',label:'Risorsa'},{id:'chg_ytd',label:'CHG YTD'},{id:'ore_periodo',label:'Ore periodo'}] },
          { key: 'chg-periodo', label: 'CHG Periodo',  fields: [{id:'chg_02',label:'CHG 02/26'},{id:'chg_03',label:'CHG 03/26'},{id:'chg_04',label:'CHG 04/26'},{id:'chg_05',label:'CHG 05/26'}] },
          { key: 'stato-mens',  label: 'Stato mensile', fields: [{id:'stato_gen',label:'Stato Gennaio'},{id:'stato_feb',label:'Stato Febbraio'},{id:'stato_mar',label:'Stato Marzo'}] },
        ],
      },
      {
        subId: 'gestione-approvazioni', catId: 'gestione', label: 'Approvazioni',
        presets: [
          { label: 'Approvazioni in sospeso',  description: 'Periodi in stato In approvazione del periodo corrente' },
          { label: 'Approvazioni completate',  description: 'Periodi approvati del mese precedente' },
        ],
        filters: [
          { id: 'periodo', type: 'periodo',     label: 'Periodo' },
          { id: 'stato',   type: 'multiselect', label: 'Stato', dependsOn: 'periodo',
            options: ['In approvazione','Approvato','In errore','Elaborato','Stornato'].map(v => ({ value: v.toLowerCase().replace(/ /g,'-'), label: v })) },
          { id: 'nome_cognome', type: 'text', label: 'Nome/Cognome' },
          { id: 'gruppo',       type: 'text', label: 'Gruppo' },
        ],
        fieldGroups: [
          { key: 'dati-approv', label: 'Dati approvazione', fields: [{id:'risorsa',label:'Risorsa'},{id:'periodo',label:'Periodo'},{id:'stato',label:'Stato'},{id:'check_approv',label:'Check approvazioni'},{id:'gg_lavorazione',label:'Giorni lavorazione'},{id:'data_conferma',label:'Data di conferma'}] },
          { key: 'date-stato',  label: 'Date di stato',     fields: [{id:'dt_approv',label:'Data/ora Approvazione'},{id:'dt_errore',label:'Data/ora In errore'},{id:'dt_elaborato',label:'Data/ora Elaborato'}] },
        ],
      },
    ],
  },
  {
    catId: 'commesse', label: 'Commesse', icon: 'work',
    subSections: [
      {
        subId: 'commesse-lista', catId: 'commesse', label: 'Lista commesse',
        presets: [
          { label: 'Commesse aperte',                    description: 'Tutte le commesse in stato Aperto' },
          { label: 'Commesse per tipologia',             description: 'Raggruppate per tipo: Esterna, Interna...' },
          { label: 'Commesse di cui sono responsabile',  description: 'Solo le tue commesse' },
        ],
        filters: [
          { id: 'cliente',       type: 'text',        label: 'Cliente' },
          { id: 'nome_commessa', type: 'text',        label: 'Nome commessa' },
          { id: 'tipologia',     type: 'multiselect', label: 'Tipologia',
            options: [{value:'esterna',label:'Esterna'},{value:'interna',label:'Interna'},{value:'amministrativa',label:'Amministrativa'},{value:'investimento',label:'Investimento'}] },
          { id: 'stato_commessa', type: 'select', label: 'Stato commessa',
            options: [{value:'tutti',label:'Tutti'},{value:'aperto',label:'Aperto'},{value:'chiuso',label:'Chiuso'},{value:'cancellato',label:'Cancellato'}] },
        ],
        fieldGroups: [
          { key: 'dati-commessa', label: 'Dati commessa', fields: [{id:'cliente',label:'Cliente'},{id:'cod_commessa',label:'Cod. commessa'},{id:'nome_commessa',label:'Nome commessa'},{id:'tipologia',label:'Tipologia'},{id:'responsabile',label:'Responsabile'},{id:'stato',label:'Stato'}] },
          { key: 'date-ab',       label: 'Date e abilitazioni', fields: [{id:'inizio_fine',label:'Inizio/fine commessa'},{id:'inizio_fine_ab',label:'Inizio/fine abilitazione'},{id:'stato_ab',label:'Stato abilitazione'}] },
        ],
      },
      {
        subId: 'commesse-abilitazioni', catId: 'commesse', label: 'Gestione abilitazioni',
        presets: [
          { label: 'Abilitazioni attive per risorsa', description: 'Tutte le abilitazioni con stato Attivato' },
          { label: 'Abilitazioni da approvare',       description: 'Abilitazioni in stato Richiesto' },
        ],
        filters: [
          { id: 'stato',    type: 'multiselect', label: 'Stato', options: [{value:'richiesto',label:'Richiesto'},{value:'approvato',label:'Approvato'},{value:'rifiutato',label:'Rifiutato'},{value:'scaduto',label:'Scaduto'},{value:'attivato',label:'Attivato'}] },
          { id: 'risorsa',  type: 'text', label: 'Risorsa' },
          { id: 'cliente',  type: 'text', label: 'Cliente' },
          { id: 'commessa', type: 'text', label: 'Commessa' },
        ],
        fieldGroups: [
          { key: 'dati-ab', label: 'Dati abilitazione', fields: [{id:'risorsa',label:'Risorsa'},{id:'cliente',label:'Cliente'},{id:'cod_commessa',label:'Codice commessa'},{id:'commessa',label:'Commessa'},{id:'validita',label:'Validità'},{id:'stato_approv',label:'Stato approvazione'}] },
          { key: 'approv',  label: 'Approvazione',       fields: [{id:'approvatori',label:'Approvatori'},{id:'approvato_da',label:'Approvato da'},{id:'dt_approv',label:'Data approvazione'},{id:'gg_lavorazione',label:'Giorni lavorazione'}] },
        ],
      },
      {
        subId: 'commesse-anagrafica', catId: 'commesse', label: 'Anagrafica',
        presets: [
          { label: 'Commesse attive per cliente',        description: 'Tutte le commesse aperte per cliente' },
          { label: 'Tutti i task per commessa',          description: 'Task associati a ogni commessa' },
          { label: 'Anagrafica completa clienti attivi', description: 'Gerarchia Cliente > Contratto > Commessa > Task' },
        ],
        filters: [
          { id: 'cliente',       type: 'text',   label: 'Cliente' },
          { id: 'stato_cliente', type: 'select', label: 'Stato cliente', options: [{value:'attivo',label:'Attivo'},{value:'non-attivo',label:'Non attivo'}] },
          { id: 'commessa',      type: 'text',   label: 'Commessa' },
        ],
        fieldGroups: [
          { key: 'livello-cliente',   label: 'Livello Cliente',   fields: [{id:'nome_cliente',label:'Nome cliente'},{id:'stato_cliente',label:'Stato cliente'},{id:'account_manager',label:'Account Manager'}] },
          { key: 'livello-contratto', label: 'Livello Contratto', fields: [{id:'nome_contratto',label:'Nome contratto'},{id:'cod_contratto',label:'Codice contratto'}] },
          { key: 'livello-commessa',  label: 'Livello Commessa',  fields: [{id:'nome_commessa',label:'Nome commessa'},{id:'cod_commessa',label:'Codice commessa'},{id:'stato_commessa',label:'Stato commessa'},{id:'project_owner',label:'Project Owner'}] },
        ],
      },
    ],
  },
  {
    catId: 'ferie', label: 'Ferie & Permessi', icon: 'beach_access',
    subSections: [{
      subId: 'ferie-richiesta', catId: 'ferie', label: 'Richiesta Ferie/Permessi',
      presets: [
        { label: 'Richieste in sospeso',            description: 'Tutte le richieste con stato Richiesto' },
        { label: 'Ferie approvate periodo corrente', description: 'Ferie approvate nel mese in corso' },
        { label: 'Storico permessi',                description: 'Tutte le richieste chiuse per anno' },
      ],
      filters: [
        { id: 'utente',      type: 'text',        label: 'Utente' },
        { id: 'data_inizio', type: 'date',        label: 'Data inizio' },
        { id: 'data_fine',   type: 'date',        label: 'Data fine' },
        { id: 'stato',       type: 'multiselect', label: 'Stato', options: [{value:'richiesto',label:'Richiesto'},{value:'approvato',label:'Approvato'},{value:'rifiutato',label:'Rifiutato'},{value:'scaduto',label:'Scaduto'}] },
        { id: 'richieste',   type: 'select',      label: 'Richieste', options: [{value:'da-me',label:'Richieste effettuate da me'},{value:'approvatore',label:'Richieste per cui sono approvatore'},{value:'in-cc',label:'Richieste per cui sono in CC'}] },
      ],
      fieldGroups: [
        { key: 'dati-richiesta', label: 'Dati richiesta', fields: [{id:'utente',label:'Utente'},{id:'tipo_richiesta',label:'Tipo di richiesta'},{id:'dt_inizio',label:'Data inizio'},{id:'dt_fine',label:'Data fine'},{id:'motivo',label:'Motivo richiesta'},{id:'ore',label:'Ore'},{id:'stato',label:'Stato'}] },
        { key: 'approvatori',    label: 'Approvatori',    fields: [{id:'approvatori',label:'Approvatori'},{id:'motivo_rifiuto',label:'Motivo del rifiuto'},{id:'rifiutato_da',label:'Rifiutato da'}] },
      ],
    }],
  },
  {
    catId: 'configurazioni', label: 'Configurazioni', icon: 'settings',
    subSections: [{
      subId: 'config-gruppi', catId: 'configurazioni', label: 'Gruppi',
      presets: [
        { label: 'Elenco completo gruppi strutturali',  description: 'Tutti i gruppi di tipo Strutturale' },
        { label: 'Gruppi con utenti Standard e Owner',  description: 'Elenco utenti per ogni gruppo' },
        { label: 'Gerarchia padre-figlio',              description: 'Struttura gerarchica completa' },
      ],
      filters: [
        { id: 'nome_gruppo', type: 'text',   label: 'Nome gruppo' },
        { id: 'tipo_gruppo', type: 'select', label: 'Tipo gruppo', options: [{value:'strutturale',label:'Strutturale'},{value:'logico',label:'Logico'},{value:'sede',label:'Sede'}] },
        { id: 'approvatore', type: 'text',   label: 'Approvatore' },
        { id: 'utente',      type: 'text',   label: 'Utente' },
      ],
      fieldGroups: [
        { key: 'dati-gruppo',  label: 'Dati gruppo',            fields: [{id:'nome_gruppo',label:'Nome gruppo'},{id:'tipo_gruppo',label:'Tipo gruppo'}] },
        { key: 'gerarchie',    label: 'Relazioni gerarchiche',  fields: [{id:'gruppi_padre',label:'Gruppi padre'},{id:'gruppi_figlio',label:'Gruppi figlio'}] },
        { key: 'approvatori',  label: 'Approvatori',            fields: [{id:'gruppi_approv',label:'Gruppi approvatori'}] },
        { key: 'utenti',       label: 'Utenti',                 fields: [{id:'utenti_std',label:'Utenti Standard'},{id:'utenti_owner',label:'Utenti Owner'}] },
      ],
    }],
  },
];

export const CASCADING_DATA_MOCK: CascadingClient[] = [
  {
    id: 'CL_0614', label: 'AGIC TECHNOLOGY SRL - CL_0614',
    commesse: [
      { id: '22/0752', label: 'ACTION PER TEAM BUILDING - AGIC TECHNOLOGY SRL - 22/0752', task: [{id:'T006',label:'Management - T006'},{id:'T002',label:'Sede - T002'},{id:'T001',label:'Unità di appartenenza - T001'}] },
      { id: '18/0002', label: 'FERIE - AGIC TECHNOLOGY SRL - 18/0002',             task: [{id:'0000',label:'Task default - 0000'}] },
      { id: '18/0001', label: "FESTIVITA' - AGIC TECHNOLOGY SRL - 18/0001",        task: [{id:'0000',label:'Task default - 0000'}] },
      { id: '19/0551', label: 'FORMAZIONE AUTORIZZATA - AGIC TECHNOLOGY SRL - 19/0551', task: [{id:'T0006',label:'Corso in Aula/E-Learning - T0006'},{id:'T0001',label:'Prodotto - T0001'},{id:'T0002',label:'Studio Certificazione - T0002'}] },
      { id: '26/0395', label: 'TIME VISION - AGIC TECHNOLOGY SRL - 26/0395',       task: [{id:'0000',label:'Task default - 0000'}] },
    ],
  },
  {
    id: 'CL_2474', label: 'KIKO SPA - CL_2474',
    commesse: [
      { id: '25/1845', label: 'Nuova Intranet SharePoint - KIKO SPA - 25/1845', task: [{id:'0000',label:'Task default - 0000'}] },
    ],
  },
  {
    id: 'CL_1600', label: 'ENI SPA - CL_1600',
    commesse: [
      { id: '25/0790', label: 'ENI: ACPV - Sibylla - ENI SPA - 25/0790', task: [{id:'0001',label:'Documentazione - 0001'},{id:'0007',label:'Infrastruttura - 0007'},{id:'0002',label:'Project Management - 0002'},{id:'0008',label:'Riunioni e SAL - 0008'},{id:'0003',label:'Sviluppo - 0003'}] },
    ],
  },
];

export const STORICO_MOCK: StoricoRecord[] = [
  { id:'1',  template:'Timesheet aperti del periodo corrente', versione:'v1.2', formato:'xlsx', stato:'pronto',          dataRichiesta:'01/07/2026 08:44', nomeFile:'Report_Timesheetapertidel_20260701_0844.xlsx',   dimensione:'5.26 MB', filtriApplicati:{ Periodo:'01/07/2026 – 15/07/2026', Stato:'Aperto, In approvazione', Risorsa:'Mario Rossi' }, colonneIncluse:['Risorsa','Periodo','Stato','Cliente','Commessa','Task','Totale ore'] },
  { id:'2',  template:'Ore totali per commessa',               versione:'v2.0', formato:'csv',  stato:'scaricato',       dataRichiesta:'25/06/2026 14:32', nomeFile:'Report_Oretotalipercommessa_20260625_1432.csv',   dimensione:'1.84 MB', dataDownload:'02/07/2026 09:15', filtriApplicati:{ Periodo:'01/06/2026 – 15/06/2026', Cliente:'AGIC Technology SRL' }, colonneIncluse:['Risorsa','Periodo','Stato','Commessa','Task','Totale ore'] },
  { id:'3',  template:'Commesse aperte',                       versione:'v1.0', formato:'xlsx', stato:'in-elaborazione', dataRichiesta:'03/07/2026 11:20', nomeFile:'Report_Commesseaperte_20260703_1120.xlsx',        dimensione:'—',       filtriApplicati:{ Cliente:'AGIC Technology SRL', Anno:'2026' }, colonneIncluse:['Cliente','Cod. commessa','Nome commessa','Tipologia','Stato'] },
  { id:'4',  template:'Richieste in sospeso',                  versione:'v1.1', formato:'csv',  stato:'fallito',         dataRichiesta:'28/06/2026 08:05', nomeFile:'Report_Richiesteinsospeso_20260628_0805.csv',     dimensione:'—', dataFallimento:'29/06/2026 06:30', filtriApplicati:{ Stato:'Richiesto, Approvato, Rifiutato' }, colonneIncluse:['Utente','Tipo di richiesta','Data inizio','Data fine','Stato'] },
  { id:'5',  template:'Abilitazioni attive per risorsa',       versione:'v1.0', formato:'xlsx', stato:'scaduto',         dataRichiesta:'15/06/2026 16:45', nomeFile:'Report_Abilitazioniattive_20260615_1645.xlsx',    dimensione:'3.12 MB', filtriApplicati:{ Cliente:'AGIC Technology SRL' }, colonneIncluse:['Risorsa','Cliente','Commessa','Validità','Stato approvazione'] },
  { id:'6',  template:'Approvazioni in sospeso',               versione:'v1.3', formato:'csv',  stato:'accettato',       dataRichiesta:'03/07/2026 17:22', nomeFile:'Report_Approvazioniinospe_20260703_1722.csv',    dimensione:'—',       filtriApplicati:{ Periodo:'01/07/2026 – 15/07/2026', Stato:'In approvazione' }, colonneIncluse:['Risorsa','Periodo','Stato','Giorni lavorazione'] },
  { id:'7',  template:'Periodi aperti nel mese corrente',      versione:'v1.1', formato:'xlsx', stato:'pronto',          dataRichiesta:'02/07/2026 10:18', nomeFile:'Report_Periodiaperti_20260702_1018.xlsx',         dimensione:'892 KB',  filtriApplicati:{ Anno:'2026', Stato:'Aperto, In approvazione' }, colonneIncluse:['Risorsa','CHG YTD','Ore periodo','Stato Gennaio','Stato Febbraio'] },
  { id:'8',  template:'Ore totali per commessa',               versione:'v2.0', formato:'xlsx', stato:'scaricato',       dataRichiesta:'30/06/2026 16:05', nomeFile:'Report_Oretotalipercommessa_20260630_1605.xlsx',  dimensione:'2.31 MB', dataDownload:'01/07/2026 09:00', filtriApplicati:{ Periodo:'16/06/2026 – 30/06/2026', Cliente:'KIKO SPA - CL_2474' }, colonneIncluse:['Risorsa','Periodo','Stato','Commessa','Totale ore'] },
  { id:'9',  template:'Commesse attive per cliente',           versione:'v1.0', formato:'csv',  stato:'pronto',          dataRichiesta:'30/06/2026 14:22', nomeFile:'Report_Commesseattiveper_20260630_1422.csv',     dimensione:'1.12 MB', filtriApplicati:{ Cliente:'ENI SPA - CL_1600', 'Stato cliente':'Attivo' }, colonneIncluse:['Nome cliente','Nome commessa','Tipologia','Responsabile','Stato'] },
  { id:'10', template:'Timesheet aperti del periodo corrente', versione:'v1.2', formato:'csv',  stato:'scaricato',       dataRichiesta:'27/06/2026 08:10', nomeFile:'Report_Timesheetapertidel_20260627_0810.csv',    dimensione:'3.88 MB', dataDownload:'28/06/2026 10:45', filtriApplicati:{ Periodo:'16/06/2026 – 30/06/2026', Gruppo:'Sviluppo' }, colonneIncluse:['Risorsa','Periodo','Stato','Commessa','Totale ore'] },
  { id:'11', template:'Riepilogo CHG annuale',                 versione:'v1.1', formato:'xlsx', stato:'fallito',         dataRichiesta:'26/06/2026 17:30', nomeFile:'Report_RiepilogoCHGannual_20260626_1730.xlsx',   dimensione:'—', dataFallimento:'27/06/2026 02:15', filtriApplicati:{ Anno:'2026' }, colonneIncluse:['Risorsa','CHG YTD','CHG 02/26','CHG 03/26','CHG 04/26'] },
  { id:'12', template:'Richieste in sospeso',                  versione:'v1.1', formato:'xlsx', stato:'scaricato',       dataRichiesta:'25/06/2026 09:14', nomeFile:'Report_Richiesteinsospeso_20260625_0914.xlsx',   dimensione:'654 KB',  dataDownload:'26/06/2026 08:30', filtriApplicati:{ 'Data inizio':'01/06/2026', 'Data fine':'30/06/2026' }, colonneIncluse:['Utente','Tipo di richiesta','Data inizio','Data fine','Ore','Stato'] },
  { id:'13', template:'Ferie approvate periodo corrente',      versione:'v1.0', formato:'xlsx', stato:'pronto',          dataRichiesta:'24/06/2026 11:05', nomeFile:'Report_Ferieapprovat_20260624_1105.xlsx',         dimensione:'420 KB',  filtriApplicati:{ Periodo:'01/06/2026 – 30/06/2026', Stato:'Approvato' }, colonneIncluse:['Utente','Tipo di richiesta','Data inizio','Data fine','Ore','Stato'] },
  { id:'14', template:'Anagrafica completa clienti attivi',    versione:'v1.0', formato:'csv',  stato:'scaricato',       dataRichiesta:'23/06/2026 15:40', nomeFile:'Report_Anagraficaclient_20260623_1540.csv',      dimensione:'2.77 MB', dataDownload:'24/06/2026 07:20', filtriApplicati:{ 'Stato cliente':'Attivo' }, colonneIncluse:['Nome cliente','Nome contratto','Nome commessa','Project Owner'] },
  { id:'15', template:'Tutti i task per commessa',             versione:'v2.1', formato:'xlsx', stato:'pronto',          dataRichiesta:'22/06/2026 09:30', nomeFile:'Report_Tuttitaskperco_20260622_0930.xlsx',       dimensione:'1.56 MB', filtriApplicati:{ Cliente:'AGIC Technology SRL', Commessa:'TIME VISION - AGIC TECHNOLOGY SRL - 26/0395' }, colonneIncluse:['Nome cliente','Nome commessa','Task','Responsabile'] },
  { id:'16', template:'Periodi aperti nel mese corrente',      versione:'v1.0', formato:'csv',  stato:'in-elaborazione', dataRichiesta:'04/07/2026 07:55', nomeFile:'Report_Periodiaperti_20260704_0755.csv',         dimensione:'—',       filtriApplicati:{ Anno:'2026', Gruppo:'HR' }, colonneIncluse:['Risorsa','CHG YTD','Ore periodo'] },
  { id:'17', template:'Ore totali per commessa',               versione:'v3.0', formato:'xlsx', stato:'pronto',          dataRichiesta:'04/07/2026 06:20', nomeFile:'Report_Oretotalipercommessa_20260704_0620.xlsx',  dimensione:'4.10 MB', filtriApplicati:{ Periodo:'01/07/2026 – 04/07/2026', Cliente:'ENI SPA - CL_1600' }, colonneIncluse:['Risorsa','Periodo','Commessa','Task','Totale ore','Ore ordinarie'] },
  { id:'18', template:'Elenco completo gruppi strutturali',    versione:'v1.0', formato:'csv',  stato:'scaduto',         dataRichiesta:'20/06/2026 14:15', nomeFile:'Report_Gruppistruttur_20260620_1415.csv',         dimensione:'218 KB',  filtriApplicati:{ 'Tipo gruppo':'Strutturale' }, colonneIncluse:['Nome gruppo','Tipo gruppo','Gruppi padre','Gruppi figlio'] },
  { id:'19', template:'Abilitazioni da approvare',             versione:'v1.0', formato:'xlsx', stato:'accettato',       dataRichiesta:'19/06/2026 10:50', nomeFile:'Report_Abilitazionidap_20260619_1050.xlsx',      dimensione:'—',       filtriApplicati:{ Stato:'Richiesto' }, colonneIncluse:['Risorsa','Cliente','Commessa','Validità','Stato approvazione','Approvatori'] },
  { id:'20', template:'Commesse per tipologia',                versione:'v1.2', formato:'csv',  stato:'scaricato',       dataRichiesta:'18/06/2026 16:30', nomeFile:'Report_Commessepertipo_20260618_1630.csv',       dimensione:'876 KB',  dataDownload:'19/06/2026 09:10', filtriApplicati:{ Tipologia:'Esterna, Interna', 'Stato commessa':'Aperto' }, colonneIncluse:['Cliente','Tipologia','Nome commessa','Responsabile','Stato'] },
  { id:'21', template:'Storico permessi',                      versione:'v1.0', formato:'xlsx', stato:'pronto',          dataRichiesta:'17/06/2026 13:20', nomeFile:'Report_Storicoperme_20260617_1320.xlsx',          dimensione:'1.33 MB', filtriApplicati:{ 'Data inizio':'01/01/2026', 'Data fine':'30/06/2026', Utente:'Tutti' }, colonneIncluse:['Utente','Tipo di richiesta','Data inizio','Data fine','Ore','Stato','Approvato da'] },
  { id:'22', template:'Riepilogo CHG annuale',                 versione:'v1.2', formato:'csv',  stato:'scaricato',       dataRichiesta:'16/06/2026 08:45', nomeFile:'Report_RiepilogoCHGannual_20260616_0845.csv',    dimensione:'987 KB',  dataDownload:'17/06/2026 07:30', filtriApplicati:{ Anno:'2025' }, colonneIncluse:['Risorsa','CHG YTD','CHG 01/25','CHG 02/25','CHG 03/25','CHG 04/25'] },
  { id:'23', template:'Timesheet aperti del periodo corrente', versione:'v1.1', formato:'xlsx', stato:'fallito',         dataRichiesta:'15/06/2026 17:00', nomeFile:'Report_Timesheetapertidel_20260615_1700.xlsx',   dimensione:'—', dataFallimento:'16/06/2026 03:45', filtriApplicati:{ Periodo:'01/06/2026 – 15/06/2026', Stato:'Aperto', Gruppo:'Finance' }, colonneIncluse:['Risorsa','Periodo','Stato','Commessa','Totale ore'] },
  { id:'24', template:'Note spese del periodo',                versione:'v1.0', formato:'csv',  stato:'pronto',          dataRichiesta:'14/06/2026 10:10', nomeFile:'Report_Notespesedel_20260614_1010.csv',           dimensione:'2.05 MB', filtriApplicati:{ Periodo:'01/05/2026 – 31/05/2026', Cliente:'KIKO SPA - CL_2474' }, colonneIncluse:['Data','Cliente / Commessa / Task','Causale','Importo riga','Rimborso','Tracciabile'] },
  { id:'25', template:'Commesse di cui sono responsabile',     versione:'v1.0', formato:'xlsx', stato:'scaricato',       dataRichiesta:'13/06/2026 09:00', nomeFile:'Report_Commesserespons_20260613_0900.xlsx',      dimensione:'543 KB',  dataDownload:'14/06/2026 07:50', filtriApplicati:{ Risorsa:'Mario Rossi', 'Stato commessa':'Aperto' }, colonneIncluse:['Cliente','Cod. commessa','Nome commessa','Tipologia','Responsabile','Stato'] },
];

export const MY_REPORTS_MOCK: Record<string, SavedReport[]> = {
  'ts-corrente': [
    { title: 'Timesheet personale luglio', description: 'Ore mie per commessa nel periodo corrente', filterValues: { periodo: '01/07/2026 – 31/07/2026', stato: ['approvato'], nome_cognome: 'Mario Rossi' }, selectedFieldIds: ['risorsa','periodo','stato','commessa','totale_ore'] },
    { title: 'Team Sviluppo – ore ordinarie', description: 'Ore ordinarie di tutto il team sviluppo', filterValues: { periodo: '01/07/2026 – 31/07/2026', gruppo: 'Sviluppo' }, selectedFieldIds: ['risorsa','periodo','ore_ordinarie','commessa','task'] },
    { title: 'Note spese KIKO giugno', description: 'Note spese su commesse KIKO SPA nel mese di giugno', filterValues: { periodo: '01/06/2026 – 30/06/2026', cliente: 'CL_2474' }, selectedFieldIds: ['ns_data','ns_commessa','ns_causale','ns_importo','ns_rimborso'] },
  ],
  'gestione-controllo': [
    { title: 'CHG annuale 2026', description: 'Riepilogo CHG per tutte le risorse nel 2026', filterValues: { anno: '2026' }, selectedFieldIds: ['risorsa','chg_ytd','chg_02','chg_03','chg_04','chg_05'] },
    { title: 'Periodi aperti HR', description: 'Risorse del gruppo HR con periodo ancora aperto', filterValues: { anno: '2026', gruppo: 'HR' }, selectedFieldIds: ['risorsa','ore_periodo','stato_gen','stato_feb','stato_mar'] },
  ],
  'gestione-approvazioni': [
    { title: 'In approvazione luglio', description: 'Periodi in stato In approvazione del mese corrente', filterValues: { periodo: '01/07/2026 – 31/07/2026', stato: ['in-approvazione'] }, selectedFieldIds: ['risorsa','periodo','stato','gg_lavorazione','approvatori'] },
  ],
  'commesse-lista': [
    { title: 'Commesse aperte AGIC', description: 'Tutte le commesse aperte di AGIC Technology', filterValues: { cliente: 'AGIC Technology SRL', stato_commessa: 'aperto' }, selectedFieldIds: ['cliente','cod_commessa','nome_commessa','tipologia','responsabile','stato'] },
    { title: 'Commesse esterne attive', description: 'Solo commesse di tipo Esterna in stato Aperto', filterValues: { tipologia: ['esterna'], stato_commessa: 'aperto' }, selectedFieldIds: ['cliente','nome_commessa','tipologia','responsabile','stato','inizio_fine'] },
  ],
  'ferie-richiesta': [
    { title: 'Richieste in sospeso mie', description: 'Le mie richieste ferie/permessi in stato Richiesto', filterValues: { richieste: 'da-me', stato: ['richiesto'] }, selectedFieldIds: ['tipo_richiesta','dt_inizio','dt_fine','motivo','ore','stato'] },
  ],
};

