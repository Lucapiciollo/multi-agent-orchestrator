import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Interceptor placeholder (header/auth/log) — punto unico dove agganciare
 * in futuro token Bearer, correlation-id, gestione errori HTTP globale, ecc.
 */
@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
   intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
      return next.handle(req);
   }
}
