import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { load, selectData, selectIsLoading } from './redux/configurazioni.state';

/**
 * Punto di innesto per la libreria generata lib-configurazioni.
 * Quando la lib e' pronta, importarne il modulo in ConfigurazioniModule e sostituire
 * il template sotto con il selector del componente d'ingresso della lib (`index`).
 */
@Component({
    selector: 'app-configurazioni',
    templateUrl: './configurazioni.component.html',
    styleUrls: ['./configurazioni.component.scss'],
    standalone: false
})
export class ConfigurazioniComponent implements OnInit {
   readonly isLoading$ = this.store.select(selectIsLoading);
   readonly data$ = this.store.select(selectData);

   constructor(private store: Store) {}

   ngOnInit(): void {
      this.store.dispatch(load());
   }
}
