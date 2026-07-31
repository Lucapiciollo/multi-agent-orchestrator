import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { load, selectData, selectIsLoading } from './redux/download.state';

/**
 * Punto di innesto per la libreria generata lib-download.
 * Quando la lib e' pronta, importarne il modulo in DownloadModule e sostituire
 * il template sotto con il selector del componente d'ingresso della lib (`index`).
 */
@Component({
    selector: 'app-download',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss'],
    standalone: false
})
export class DownloadComponent implements OnInit {
   readonly isLoading$ = this.store.select(selectIsLoading);
   readonly data$ = this.store.select(selectData);

   constructor(private store: Store) {}

   ngOnInit(): void {
      this.store.dispatch(load());
   }
}
