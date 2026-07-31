import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

export interface InputFile { name: string; size: number; uploadedAt: string; }

export interface RoutingRule {
  id: string;
  label: string;
  description: string;
  match: { extensions: string[]; mimeTypes: string[] };
  workflowId: string;
  icon: string;
}

export interface UploadAndRunResult {
  file: { name: string; size: number };
  matched: { ruleId: string; label: string; workflowId: string };
  execution: { id: string; status: string };
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  constructor(private http: HttpClient) {}

  listInputFiles(): Observable<InputFile[]> {
    return this.http.get<any>('/api/workspace/input').pipe(map(r => r.data));
  }

  uploadFile(file: File): Observable<{ name: string; size: number; path: string }> {
    return from(this.readAsBase64(file)).pipe(
      switchMap(b64 =>
        this.http.post<any>('/api/workspace/input', { name: file.name, content: b64, mimeType: file.type })
          .pipe(map(r => r.data))
      )
    );
  }

  deleteFile(name: string): Observable<void> {
    return this.http.delete<any>(`/api/workspace/input/${encodeURIComponent(name)}`).pipe(map(() => undefined));
  }

  getRoutingRules(): Observable<{ rules: RoutingRule[] }> {
    return this.http.get<any>('/api/workspace/routing').pipe(map(r => r.data));
  }

  uploadAndRun(file: File, workflowId?: string): Observable<UploadAndRunResult> {
    return from(this.readAsBase64(file)).pipe(
      switchMap(b64 =>
        this.http.post<any>('/api/workspace/upload-and-run', {
          name: file.name,
          content: b64,
          mimeType: file.type,
          ...(workflowId ? { workflowId } : {})
        }).pipe(map(r => r.data))
      )
    );
  }

  private readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // rimuove il prefisso "data:...;base64,"
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
