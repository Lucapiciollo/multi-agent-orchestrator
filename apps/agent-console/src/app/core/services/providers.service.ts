import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProvidersService {
  constructor(private api: ApiService) {}
  getStatus(): Observable<any[]> { return this.api.get<any>('/api/providers/status').pipe(map((r: any) => r.data as any[])); }
}
