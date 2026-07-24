import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProvidersList } from './providers-list/providers-list';

const routes: Routes = [{ path: '', component: ProvidersList }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ProvidersRoutingModule {}
