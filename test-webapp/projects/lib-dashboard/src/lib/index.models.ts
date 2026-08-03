// index.models.ts — lib-dashboard
// Tutte le interfacce/type della feature Dashboard.
// Fonte: workspace/output/angular/reports/architecture-report.md §MODELS/INTERFACES

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  azienda: string;
  segmento: 'enterprise' | 'pmi' | 'startup' | string;
  stato: 'ok' | 'wait' | 'off';
  ultimoContatto: string; // ISO date
  valore: number;
}

export interface StatCard {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaWarning?: boolean; // true per "Da ricontattare"
}

export interface Activity {
  id: string;
  icon: '☎' | '✉' | '✓' | '📅' | string;
  title: string;
  description: string;
}

export interface ClientiFilters {
  ricerca?: string;
  stato?: string;
  segmento?: string;
  accountManager?: string;
}

export interface NuovoClientePayload {
  nome: string;
  cognome: string;
  azienda?: string;
  email: string;
  segmento?: string;
  statoIniziale?: string;
  note?: string;
}

export interface ProfiloCommercialePayload {
  nome: string;
  cognome: string;
  azienda?: string;
  ruolo?: string;
  email: string;
  telefono?: string;
  priorita?: string;
  prossimoContatto?: string;
  note?: string;
  newsletter?: boolean;
  comunicazioniCommerciali?: boolean;
  vip?: boolean;
}

/**
 * Risultato paginato usato da DashboardService.getClienti() / ClientiEffects.
 * Non elencato esplicitamente in architecture-report.md ma necessario per il
 * pattern "items + total" richiesto da 'Load Clienti Success' (dashboard.actions.ts).
 */
export interface ClientiQueryResult {
  items: Cliente[];
  total: number;
}
