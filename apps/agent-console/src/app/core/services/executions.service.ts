import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ExecutionsService {
  constructor(private api: ApiService) {}
  getAll(): Observable<any[]> { return this.api.get<any>('/api/executions').pipe(map((r: any) => r.data as any[])); }
  getById(id: string): Observable<any> { return this.api.get<any>(`/api/executions/${id}`).pipe(map((r: any) => r.data)); }
  start(req: any): Observable<any> { return this.api.post<any>('/api/executions', req).pipe(map((r: any) => r.data)); }
  cancel(id: string): Observable<any> { return this.api.post<any>(`/api/executions/${id}/cancel`, {}).pipe(map((r: any) => r.data)); }
  retryTask(execId: string, taskId: string): Observable<any> { return this.api.post<any>(`/api/executions/${execId}/tasks/${taskId}/retry`, {}).pipe(map((r: any) => r.data)); }
  getGate(execId: string): Observable<any> { return this.api.get<any>(`/api/executions/${execId}/gate`).pipe(map((r: any) => r.data)); }
  selectSection(execId: string, section: string): Observable<any> { return this.api.post<any>(`/api/executions/${execId}/select-section`, { section }).pipe(map((r: any) => r.data)); }
  getWorkspaceOutput(runSlug?: string): Observable<any[]> {
    const url = runSlug ? `/api/workspace/output?runSlug=${encodeURIComponent(runSlug)}` : '/api/workspace/output';
    return this.api.get<any>(url).pipe(map((r: any) => r.data as any[]));
  }
  streamEvents(execId: string, destroy$: Subject<void>): Observable<any> {
    const es = this.api.getEventSource(`/api/executions/${execId}/events`);
    return new Observable<any>(obs => {
      const h = (e: MessageEvent) => { try { obs.next(JSON.parse(e.data as string)); } catch { /**/ } };
      es.addEventListener('message', h); es.onerror = () => obs.error(new Error('SSE error'));
      return () => { es.removeEventListener('message', h); es.close(); };
    }).pipe(takeUntil(destroy$));
  }
}
