// index.service.ts — lib-dashboard
// DashboardService — data access ONLY. Chiamato esclusivamente da
// redux/dashboard.effects.ts (mai iniettato direttamente nei componenti),
// per regola skill Angular Component Extractor §"Mock service".
//
// Pattern mock→backend zero-code: InjectionToken<string> opzionale.
// - Se DASHBOARD_API_BASE_URL non è fornito dal modulo consumer → dati mock.
// - Se fornito (es. tramite `providers` in AppModule/FeatureModule del
//   consumer) → sostituire le righe "MOCK" con le chiamate HttpClient
//   commentate sotto ogni metodo.
//
// Nota: i dataset mock completi e a fedeltà 1:1 con il sorgente HTML
// (mock-data/dashboard.mock.ts) sono generati nel task successivo
// (Phase 8b — generazione componenti). Questo file usa mock minimi
// autosufficienti per non introdurre una dipendenza da file non ancora
// presenti nello scope di questo step (vedi "Output autorizzati").
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  Activity,
  Cliente,
  ClientiFilters,
  ClientiQueryResult,
  NuovoClientePayload,
  ProfiloCommercialePayload,
  StatCard,
} from './index.models';

export const DASHBOARD_API_BASE_URL = new InjectionToken<string>('DASHBOARD_API_BASE_URL');

const PAGE_SIZE = 10;

const CLIENTI_MOCK: Cliente[] = [
  { id: 'c-001', nome: 'Marco Rossi', email: 'marco.rossi@example.com', azienda: 'Rossi SpA', segmento: 'enterprise', stato: 'ok', ultimoContatto: '2026-07-28', valore: 42000 },
  { id: 'c-002', nome: 'Giulia Bianchi', email: 'giulia.bianchi@example.com', azienda: 'Bianchi Srl', segmento: 'pmi', stato: 'wait', ultimoContatto: '2026-07-20', valore: 15800 },
  { id: 'c-003', nome: 'Luca Verdi', email: 'luca.verdi@example.com', azienda: 'Verdi Consulting', segmento: 'startup', stato: 'off', ultimoContatto: '2026-06-15', valore: 4200 },
];

const STATS_MOCK: StatCard[] = [
  { id: 'stat-clienti-attivi', label: 'Clienti attivi', value: '128', delta: '+4 questo mese' },
  { id: 'stat-fatturato', label: 'Fatturato mensile', value: '€ 84.200', delta: '+6.2%' },
  { id: 'stat-trattative', label: 'Trattative aperte', value: '17', delta: '-2 rispetto al mese scorso' },
  { id: 'stat-da-ricontattare', label: 'Da ricontattare', value: '9', delta: 'urgente', deltaWarning: true },
];

const ACTIVITIES_MOCK: Activity[] = [
  { id: 'act-001', icon: '☎', title: 'Chiamata con Marco Rossi', description: 'Discussione rinnovo contratto annuale' },
  { id: 'act-002', icon: '✉', title: 'Email a Giulia Bianchi', description: 'Invio proposta commerciale aggiornata' },
  { id: 'act-003', icon: '✓', title: 'Attività completata', description: 'Onboarding cliente Verdi Consulting concluso' },
  { id: 'act-004', icon: '📅', title: 'Appuntamento fissato', description: 'Incontro conoscitivo nuovo lead enterprise' },
];

@Injectable()
export class DashboardService {
  constructor(
    private readonly http: HttpClient,
    @Optional() @Inject(DASHBOARD_API_BASE_URL) private readonly apiBaseUrl: string | null
  ) {}

  getClienti(filters?: ClientiFilters, page = 1): Observable<ClientiQueryResult> {
    // ✅ MOCK (default — nessun backend richiesto)
    let items = CLIENTI_MOCK;
    if (filters?.ricerca) {
      const q = filters.ricerca.toLowerCase();
      items = items.filter(
        (c) => c.nome.toLowerCase().includes(q) || c.azienda.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      );
    }
    if (filters?.stato) {
      items = items.filter((c) => c.stato === filters.stato);
    }
    if (filters?.segmento) {
      items = items.filter((c) => c.segmento === filters.segmento);
    }
    const start = (page - 1) * PAGE_SIZE;
    const paged = items.slice(start, start + PAGE_SIZE);
    return of({ items: paged, total: items.length });
    // 🔌 BACKEND — sostituire le righe sopra con:
    // return this.http.get<ClientiQueryResult>(`${this.apiBaseUrl}/clienti`, { params: { ...filters, page } as any });
  }

  getStats(): Observable<StatCard[]> {
    // ✅ MOCK
    return of(STATS_MOCK);
    // 🔌 BACKEND:
    // return this.http.get<StatCard[]>(`${this.apiBaseUrl}/stats`);
  }

  createCliente(payload: NuovoClientePayload): Observable<Cliente> {
    // ✅ MOCK
    const created: Cliente = {
      id: `c-${Date.now()}`,
      nome: `${payload.nome} ${payload.cognome}`.trim(),
      email: payload.email,
      azienda: payload.azienda ?? '',
      segmento: (payload.segmento as Cliente['segmento']) ?? 'pmi',
      stato: (payload.statoIniziale as Cliente['stato']) ?? 'wait',
      ultimoContatto: new Date().toISOString().slice(0, 10),
      valore: 0,
    };
    return of(created);
    // 🔌 BACKEND:
    // return this.http.post<Cliente>(`${this.apiBaseUrl}/clienti`, payload);
  }

  updateProfilo(payload: ProfiloCommercialePayload): Observable<void> {
    // ✅ MOCK
    return of(void 0);
    // 🔌 BACKEND:
    // return this.http.put<void>(`${this.apiBaseUrl}/profilo`, payload);
  }

  getActivities(): Observable<Activity[]> {
    // ✅ MOCK
    return of(ACTIVITIES_MOCK);
    // 🔌 BACKEND:
    // return this.http.get<Activity[]>(`${this.apiBaseUrl}/activities`);
  }
}
