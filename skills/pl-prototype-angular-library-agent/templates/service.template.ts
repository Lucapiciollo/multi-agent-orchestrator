import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { __FEATURE_PASCAL__Item } from '../models/__FEATURE__.models';

@Injectable({ providedIn: 'root' })
export class __FEATURE_PASCAL__Service {
  load(): Observable<__FEATURE_PASCAL__Item[]> {
    return of([]);
  }
}
