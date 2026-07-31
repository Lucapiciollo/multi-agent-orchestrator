import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { load, selectData, selectIsLoading } from './redux/ferie-permessi.state';

/**
 * Punto di innesto per la libreria generata lib-ferie-permessi.
 * Quando la lib e' pronta, importarne il modulo in FeriePermessiModule e sostituire
 * il template sotto con il selector del componente d'ingresso della lib (`index`).
 */
@Component({
    selector: 'app-ferie-permessi',
    templateUrl: './ferie-permessi.component.html',
    styleUrls: ['./ferie-permessi.component.scss'],
    standalone: false
})
export class FeriePermessiComponent implements OnInit {
   readonly isLoading$ = this.store.select(selectIsLoading);
   readonly data$ = this.store.select(selectData);

   constructor(private store: Store) {}

   ngOnInit(): void {
      this.store.dispatch(load());
   }
}
