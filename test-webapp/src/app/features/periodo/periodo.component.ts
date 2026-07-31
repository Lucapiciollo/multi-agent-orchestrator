import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { load, selectData, selectIsLoading } from './redux/periodo.state';

/**
 * Punto di innesto per la libreria generata lib-periodo.
 * Quando la lib e' pronta, importarne il modulo in PeriodoModule e sostituire
 * il template sotto con il selector del componente d'ingresso della lib (`index`).
 */
@Component({
    selector: 'app-periodo',
    templateUrl: './periodo.component.html',
    styleUrls: ['./periodo.component.scss'],
    standalone: false
})
export class PeriodoComponent implements OnInit {
   readonly isLoading$ = this.store.select(selectIsLoading);
   readonly data$ = this.store.select(selectData);

   constructor(private store: Store) {}

   ngOnInit(): void {
      this.store.dispatch(load());
   }
}
