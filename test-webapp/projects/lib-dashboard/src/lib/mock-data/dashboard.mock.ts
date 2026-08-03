// mock-data/dashboard.mock.ts — lib-dashboard
//
// Dati mock realistici e tipizzati secondo index.models.ts, allineati 1:1 al
// sorgente HTML (workspace/input/angular-responsive-golden-master.html,
// righe 24-40) per garantire fedeltà visiva (skill "Angular Component
// Extractor" §3 "Mock data: dati ESATTI dal sorgente").
//
// ⚠️ Nota di scope: index.service.ts (generato in un task precedente, fuori
// dagli "Output autorizzati" di questo step) usa attualmente un proprio
// dataset mock interno minimale (CLIENTI_MOCK/STATS_MOCK/ACTIVITIES_MOCK),
// come esplicitamente documentato nei suoi commenti ("dataset mock completi
// generati nel task successivo"). Questo file è quel dataset completo,
// pronto per essere importato da index.service.ts in un successivo task di
// wiring (fuori scope qui): i valori sono identici 1:1 al sorgente HTML.
import { Activity, Cliente, StatCard } from '../index.models';

export const DASHBOARD_STATS_MOCK: StatCard[] = [
  { id: 'stat-clienti-totali', label: 'Clienti totali', value: '1.284', delta: '↑ 8,4% questo mese' },
  { id: 'stat-contratti-attivi', label: 'Contratti attivi', value: '946', delta: '↑ 4,1% questo mese' },
  { id: 'stat-da-ricontattare', label: 'Da ricontattare', value: '78', delta: '12 con priorità alta', deltaWarning: true },
  { id: 'stat-fatturato-previsto', label: 'Fatturato previsto', value: '€ 182K', delta: '↑ 11,7% vs periodo precedente' },
];

// Le 4 righe visibili nel sorgente ("Mostrati 1–4 di 1284 clienti", riga 38).
// ultimoContatto usa le stesse stringhe di visualizzazione del sorgente
// (non un ISO date puro) per preservare la fedeltà visiva esatta del testo
// mostrato in tabella.
export const DASHBOARD_CLIENTI_MOCK: Cliente[] = [
  {
    id: 'cli-andrea-romano',
    nome: 'Andrea Romano',
    email: 'andrea.romano@example.it',
    azienda: 'Nova Systems S.p.A.',
    segmento: 'enterprise',
    stato: 'ok',
    ultimoContatto: 'Oggi, 08:35',
    valore: 48500,
  },
  {
    id: 'cli-giada-caruso',
    nome: 'Giada Caruso',
    email: 'g.caruso@example.it',
    azienda: 'Helix Digital',
    segmento: 'pmi',
    stato: 'wait',
    ultimoContatto: 'Ieri, 16:12',
    valore: 12800,
  },
  {
    id: 'cli-matteo-serra',
    nome: 'Matteo Serra',
    email: 'm.serra@example.it',
    azienda: 'Greenbyte',
    segmento: 'startup',
    stato: 'off',
    ultimoContatto: '28 lug 2026',
    valore: 7400,
  },
  {
    id: 'cli-elisa-ferri',
    nome: 'Elisa Ferri',
    email: 'elisa.ferri@example.it',
    azienda: 'Orion Consulting',
    segmento: 'enterprise',
    stato: 'ok',
    ultimoContatto: '26 lug 2026',
    valore: 61200,
  },
];

// Conteggio totale mostrato nel sorgente ("... di 1284 clienti"), indipendente
// dal numero di righe mockate sopra (che rappresentano solo la pagina 1).
export const DASHBOARD_CLIENTI_TOTAL_COUNT_MOCK = 1284;

export const DASHBOARD_ACTIVITIES_MOCK: Activity[] = [
  {
    id: 'act-telefonata',
    icon: '☎',
    title: 'Telefonata commerciale',
    description: 'Confermata disponibilità per demo prodotto. Oggi, 09:15.',
  },
  {
    id: 'act-email',
    icon: '✉',
    title: 'Email inviata',
    description: 'Condivisa proposta aggiornata con condizioni annuali.',
  },
  {
    id: 'act-task',
    icon: '✓',
    title: 'Task completato',
    description: 'Verifica dati amministrativi e referenti aziendali.',
  },
  {
    id: 'act-meeting',
    icon: '📅',
    title: 'Meeting pianificato',
    description: 'Demo tecnica fissata per il 5 agosto alle 11:30.',
  },
];
