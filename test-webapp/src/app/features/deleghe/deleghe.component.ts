import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { load, selectData, selectIsLoading } from './redux/deleghe.state';

/**
 * Punto di innesto per la libreria generata lib-deleghe.
 * Quando la lib e' pronta, importarne il modulo in DelegheModule e sostituire
 * il template sotto con il selector del componente d'ingresso della lib (`index`).
 */
@Component({
    selector: 'app-deleghe',
    templateUrl: './deleghe.component.html',
    styleUrls: ['./deleghe.component.scss'],
    standalone: false
})
export class DelegheComponent implements OnInit {
   readonly isLoading$ = this.store.select(selectIsLoading);
   readonly data$ = this.store.select(selectData);

   constructor(private store: Store) {}

   ngOnInit(): void {
      this.store.dispatch(load());
   }
}
