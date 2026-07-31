import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { SidebarComponent } from '../component/sidebar/sidebar.component';
import { TopbarComponent } from '../component/topbar/topbar.component';

@NgModule({
  declarations: [SidebarComponent, TopbarComponent],
  exports: [CommonModule, RouterModule, ReactiveFormsModule, MaterialModule, SidebarComponent, TopbarComponent],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MaterialModule],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class SharedModule {}
