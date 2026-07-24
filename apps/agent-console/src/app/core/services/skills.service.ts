import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SkillsService {
  constructor(private api: ApiService) {}
  getAll(): Observable<any[]> { return this.api.get<any>('/api/skills').pipe(map((r: any) => r.data as any[])); }
  getById(id: string): Observable<any> { return this.api.get<any>(`/api/skills/${id}`).pipe(map((r: any) => r.data)); }
}
