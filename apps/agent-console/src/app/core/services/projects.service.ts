import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  constructor(private api: ApiService) {}
  getAll(): Observable<any[]> { return this.api.get<any>('/api/projects').pipe(map((r: any) => r.data as any[])); }
  create(p: any): Observable<any> { return this.api.post<any>('/api/projects', p).pipe(map((r: any) => r.data)); }
  delete(id: string): Observable<void> { return this.api.delete<void>(`/api/projects/${id}`); }
}
