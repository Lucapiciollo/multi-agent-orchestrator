import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { load, selectData, selectIsLoading } from './redux/gestione-periodo.state';

/**
 * Punto di innesto per la libreria generata lib-gestione-periodo.
 * Quando la lib e' pronta, importarne il modulo in GestionePeriodoModule e sostituire
 * il template sotto con il selector del componente d'ingresso della lib (`index`).
 */
@Component({
    selector: 'app-gestione-periodo',
    templateUrl: './gestione-periodo.component.html',
    styleUrls: ['./gestione-periodo.component.scss'],
    standalone: false
})
export class GestionePeriodoComponent implements OnInit {
   readonly isLoading$ = this.store.select(selectIsLoading);
   readonly data$ = this.store.select(selectData);

   constructor(private store: Store) {}

   ngOnInit(): void {
      this.store.dispatch(load());
   }
}
