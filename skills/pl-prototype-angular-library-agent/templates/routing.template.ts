import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { __FEATURE_PASCAL__IndexPageComponent } from '../pages/__FEATURE__-index-page/__FEATURE__-index-page.component';

const routes: Routes = [
  {
    path: '',
    component: __FEATURE_PASCAL__IndexPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class __FEATURE_PASCAL__RoutingModule {}
