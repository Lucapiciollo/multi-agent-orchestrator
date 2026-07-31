import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MENU_ITEMS, BOTTOM_MENU_ITEM, CHEVRON_ICON, LOGO_MARK, HAMBURGER_ICON, MenuItem } from './menu-items';

interface RenderedMenuItem extends Omit<MenuItem, 'icon'> {
   icon: SafeHtml;
}

/** Path dopo le quali il sorgente disegna una .sb-divider-line — Fonte: righe 620, 652, 712. */
const DIVIDER_AFTER_PATHS = new Set(['commesse', 'deleghe', 'impostazioni']);

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: false
})
export class SidebarComponent {
   readonly homepageItem: RenderedMenuItem;
   readonly sectionItems: RenderedMenuItem[];
   readonly bottomItem: RenderedMenuItem;
   readonly chevronIcon: SafeHtml;
   readonly logoMark: SafeHtml;
   readonly hamburgerIcon: SafeHtml;
   readonly dividerAfter = DIVIDER_AFTER_PATHS;

   expanded = true;
   private openPath: string | null = null;

   constructor(sanitizer: DomSanitizer, router: Router) {
      const trust = (svg: string): SafeHtml => sanitizer.bypassSecurityTrustHtml(svg);
      const render = (item: MenuItem): RenderedMenuItem => ({ ...item, icon: trust(item.icon) });

      this.homepageItem = render(MENU_ITEMS[0]);
      this.sectionItems = MENU_ITEMS.slice(1).map(render);
      this.bottomItem = render(BOTTOM_MENU_ITEM);
      this.chevronIcon = trust(CHEVRON_ICON);
      this.logoMark = trust(LOGO_MARK);
      this.hamburgerIcon = trust(HAMBURGER_ICON);

      // Apri automaticamente la sezione corrispondente alla route attiva (comportamento
      // "section-open" del sorgente per la voce "Report" attiva di default — riga 716).
      this.syncOpenSectionWithUrl(router.url);
      router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
         this.syncOpenSectionWithUrl(e.urlAfterRedirects);
      });
   }

   toggle(): void {
      this.expanded = !this.expanded;
   }

   toggleSection(path: string): void {
      this.openPath = this.openPath === path ? null : path;
   }

   isOpen(path: string): boolean {
      return this.openPath === path;
   }

   private syncOpenSectionWithUrl(url: string): void {
      const match = this.sectionItems.find((item) => url.startsWith('/' + item.path));
      if (match) {
         this.openPath = match.path;
      }
   }
}
