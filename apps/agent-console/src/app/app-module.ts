import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Angular Material — shell
import { MatSidenavModule }     from '@angular/material/sidenav';
import { MatToolbarModule }     from '@angular/material/toolbar';
import { MatListModule }        from '@angular/material/list';
import { MatIconModule }        from '@angular/material/icon';
import { MatButtonModule }      from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule }     from '@angular/material/tooltip';

// NgRx
import { StoreModule }         from '@ngrx/store';
import { EffectsModule }       from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing-module';
import { App }     from './app';
import { Layout }  from './shell/layout/layout';
import { Sidebar } from './shell/sidebar/sidebar';
import { Header }  from './shell/header/header';

@NgModule({
  declarations: [App, Layout, Sidebar, Header],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatSlideToggleModule, MatTooltipModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    RouterModule
  ],
  bootstrap: [App]
})
export class AppModule {}
