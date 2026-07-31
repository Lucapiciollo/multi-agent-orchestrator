import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import {
  CascadingClient,
  ReportCategory,
  SavedReport,
  StoricoRecord,
} from './index.models';
import {
  CASCADING_DATA_MOCK,
  MY_REPORTS_MOCK,
  REPORT_CATEGORIES_MOCK,
  STORICO_MOCK,
} from './mock-data';

/**
 * Token opzionale per la URL base del backend.
 * Se non fornito (o null), il service usa i dati mock.
 *
 * Uso in AppModule (o nel modulo consumer) per attivare il BE reale:
 *   providers: [{ provide: REPORT_API_BASE_URL, useValue: 'https://api.example.com/v1/reports' }]
 *
 * Finché il token non è fornito, tutti i metodi usano of(MOCK_DATA).
 */
export const REPORT_API_BASE_URL = new InjectionToken<string>('REPORT_API_BASE_URL');

/**
 * index.service.ts — "Report" feature (slug: lib-report)
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ARCHITETTURA DATA-ACCESS:
 *   Componenti → Store (selectors) → Effects → [questo service] → Dati
 *
 * REGOLA: questo service è chiamato SOLO da redux/report.effects.ts.
 * Mai iniettare ReportService direttamente nei componenti.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * SWITCH MOCK → BACKEND REALE:
 *
 * 1. Registrare REPORT_API_BASE_URL nel modulo consumer:
 *      { provide: REPORT_API_BASE_URL, useValue: environment.reportApiUrl }
 *
 * 2. In ogni metodo sostituire la riga:
 *      return of(MOCK_DATA);
 *    con la chiamata HTTP corrispondente (già commentata sotto ogni metodo).
 *
 * Il resto dell'applicazione (componenti, effects, reducer, selectors)
 * NON deve essere modificato.
 * ─────────────────────────────────────────────────────────────────────────
 */
@Injectable()
export class ReportService {
  constructor(
    private readonly http: HttpClient,
    @Optional() @Inject(REPORT_API_BASE_URL) private readonly apiBaseUrl: string | null
  ) {}

  // ── Catalogo report ────────────────────────────────────────────────────

  getReportCatalog(): Observable<ReportCategory[]> {
    // ✅ MOCK (default — nessun backend richiesto)
    return of(REPORT_CATEGORIES_MOCK);
    // 🔌 BACKEND — sostituire la riga sopra con:
    // return this.http.get<ReportCategory[]>(`${this.apiBaseUrl}/catalog`);
  }

  // ── Filtri a cascata ───────────────────────────────────────────────────

  getCascadingData(): Observable<CascadingClient[]> {
    // ✅ MOCK
    return of(CASCADING_DATA_MOCK);
    // 🔌 BACKEND:
    // return this.http.get<CascadingClient[]>(`${this.apiBaseUrl}/cascading`);
  }

  // ── Storico ────────────────────────────────────────────────────────────

  getStorico(): Observable<StoricoRecord[]> {
    // ✅ MOCK
    return of(STORICO_MOCK);
    // 🔌 BACKEND:
    // return this.http.get<StoricoRecord[]>(`${this.apiBaseUrl}/storico`);
  }

  // ── I miei report (CRUD) ───────────────────────────────────────────────

  getMyReports(): Observable<Record<string, SavedReport[]>> {
    // ✅ MOCK
    return of(MY_REPORTS_MOCK);
    // 🔌 BACKEND:
    // return this.http.get<Record<string, SavedReport[]>>(`${this.apiBaseUrl}/my-reports`);
  }

  saveMyReport(_subId: string, payload: SavedReport): Observable<SavedReport> {
    // ✅ MOCK
    return of({ ...payload });
    // 🔌 BACKEND:
    // return this.http.post<SavedReport>(`${this.apiBaseUrl}/my-reports/${_subId}`, payload);
  }

  updateMyReport(
    _subId: string,
    _index: number,
    payload: SavedReport
  ): Observable<SavedReport> {
    // ✅ MOCK
    return of({ ...payload });
    // 🔌 BACKEND:
    // return this.http.put<SavedReport>(`${this.apiBaseUrl}/my-reports/${_subId}/${_index}`, payload);
  }

  deleteMyReport(_subId: string, _index: number): Observable<void> {
    // ✅ MOCK
    return of(undefined);
    // 🔌 BACKEND:
    // return this.http.delete<void>(`${this.apiBaseUrl}/my-reports/${_subId}/${_index}`);
  }

  // ── Export ─────────────────────────────────────────────────────────────

  requestReportExport(
    subId: string,
    format: string,
    filters: Record<string, unknown>,
    columns: string[]
  ): Observable<StoricoRecord> {
    // ✅ MOCK — simula record "in-elaborazione" creato dal server
    const record: StoricoRecord = {
      id: `exp-${Date.now()}`,
      dataRichiesta: new Date().toISOString(),
      template: subId,
      nomeFile: `report-${subId}-${Date.now()}.${format}`,
      versione: '1.0',
      dimensione: '–',
      formato: format,
      stato: 'in-elaborazione',
      filtriApplicati: filters,
      colonneIncluse: columns,
    };
    return of(record);
    // 🔌 BACKEND:
    // return this.http.post<StoricoRecord>(`${this.apiBaseUrl}/export`, { subId, format, filters, columns });
  }

  // ── Download ───────────────────────────────────────────────────────────

  downloadStoricoFile(id: string): Observable<StoricoRecord> {
    // ✅ MOCK — simula download completato
    const found = STORICO_MOCK.find((r) => r.id === id);
    const record: StoricoRecord = found
      ? { ...found, stato: 'pronto', dataDownload: new Date().toISOString() }
      : {
          id,
          dataRichiesta: new Date().toISOString(),
          template: '–',
          nomeFile: `file-${id}`,
          versione: '1.0',
          dimensione: '–',
          formato: 'xlsx',
          stato: 'pronto',
          dataDownload: new Date().toISOString(),
          filtriApplicati: {},
          colonneIncluse: [],
        };
    return of(record);
    // 🔌 BACKEND:
    // return this.http.post<StoricoRecord>(`${this.apiBaseUrl}/storico/${id}/download`, {});
  }
}

