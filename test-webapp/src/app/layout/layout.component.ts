import { Component } from '@angular/core';

/**
 * Shell principale della web app: replica lo schema sidebar (a sinistra) + topbar (in alto)
 * + area contenuti a router-outlet, come nel file HTML sorgente (#sidebar / .content).
 * E' l'unico componente non lazy-loaded: tutte le sezioni di menu sono figlie della route
 * radice gestita da questo layout.
 */
@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    standalone: false
})
export class LayoutComponent {}
