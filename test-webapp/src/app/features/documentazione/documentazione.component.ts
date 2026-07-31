import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { load, selectData, selectIsLoading } from './redux/documentazione.state';

/**
 * Punto di innesto per la libreria generata lib-documentazione.
 * Quando la lib e' pronta, importarne il modulo in DocumentazioneModule e sostituire
 * il template sotto con il selector del componente d'ingresso della lib (`index`).
 */
@Component({
    selector: 'app-documentazione',
    templateUrl: './documentazione.component.html',
    styleUrls: ['./documentazione.component.scss'],
    standalone: false
})
export class DocumentazioneComponent implements OnInit {
   readonly isLoading$ = this.store.select(selectIsLoading);
   readonly data$ = this.store.select(selectData);

   constructor(private store: Store) {}

   ngOnInit(): void {
      this.store.dispatch(load());
   }
}
