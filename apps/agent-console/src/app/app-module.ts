import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Layout } from './shell/layout/layout';
import { Sidebar } from './shell/sidebar/sidebar';
import { Header } from './shell/header/header';

@NgModule({
  declarations: [
    App,
    Layout,
    Sidebar,
    Header
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
  ],
  bootstrap: [App]
})
export class AppModule { }
