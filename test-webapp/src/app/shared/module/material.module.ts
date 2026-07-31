import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

const MATERIAL_MODULES = [
   MatButtonModule,
   MatCardModule,
   MatIconModule,
   MatListModule,
   MatMenuModule,
   MatProgressSpinnerModule,
   MatSidenavModule,
   MatToolbarModule,
   MatTooltipModule,
];

/**
 * Raccoglie i moduli Angular Material usati dalla shell e dalle feature.
 * Il tema (M3, mat.define-theme) e i design token sono quelli generati
 * dalla skill css-material-agent in workspace/output/scss/material-theme.scss,
 * importato in src/styles.scss — qui si importano solo i moduli dei componenti.
 */
@NgModule({
   imports: MATERIAL_MODULES,
   exports: MATERIAL_MODULES,
})
export class MaterialModule {}
