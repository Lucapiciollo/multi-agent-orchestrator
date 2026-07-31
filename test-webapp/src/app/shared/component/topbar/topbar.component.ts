import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MENU_ITEMS, BOTTOM_MENU_ITEM } from '../sidebar/menu-items';

/** Topbar — replica 1:1 di #topbar (righe 766-778 del sorgente): breadcrumb con
 *  chevron + titolo pagina corrente, e blocco utente (nome + organizzazione). */
@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.scss'],
    standalone: false
})
export class TopbarComponent {
   title = 'Report';
   readonly userName = 'Mario Rossi';
   readonly userOrg = 'AGIC';

   private readonly labelsByPath = new Map<string, string>(
      [...MENU_ITEMS, BOTTOM_MENU_ITEM].map((item) => [item.path, item.label]),
   );

   constructor(router: Router) {
      this.syncTitleWithUrl(router.url);
      router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
         this.syncTitleWithUrl(e.urlAfterRedirects);
      });
   }

   private syncTitleWithUrl(url: string): void {
      const segment = url.split('/').filter(Boolean)[0] ?? '';
      this.title = this.labelsByPath.get(segment) ?? this.title;
   }
}
