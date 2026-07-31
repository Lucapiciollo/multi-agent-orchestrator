import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { load, selectData, selectIsLoading } from './redux/commesse.state';

/**
 * Punto di innesto per la libreria generata lib-commesse.
 * Quando la lib e' pronta, importarne il modulo in CommesseModule e sostituire
 * il template sotto con il selector del componente d'ingresso della lib (`index`).
 */
@Component({
    selector: 'app-commesse',
    templateUrl: './commesse.component.html',
    styleUrls: ['./commesse.component.scss'],
    standalone: false
})
export class CommesseComponent implements OnInit {
   readonly isLoading$ = this.store.select(selectIsLoading);
   readonly data$ = this.store.select(selectData);

   constructor(private store: Store) {}

   ngOnInit(): void {
      this.store.dispatch(load());
   }
}
