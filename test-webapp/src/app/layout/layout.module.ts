import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/module/shared.module';
import { LayoutComponent } from './layout.component';

@NgModule({
   declarations: [LayoutComponent],
   imports: [CommonModule, RouterModule, SharedModule],
   exports: [LayoutComponent],
})
export class LayoutModule {}
