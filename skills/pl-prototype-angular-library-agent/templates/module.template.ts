import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { __FEATURE_PASCAL__RoutingModule } from './routing/__FEATURE__-routing.module';
import { __FEATURE_CAMEL__FeatureKey, __FEATURE_CAMEL__Reducer } from './store/__FEATURE__.reducer';
import { __FEATURE_PASCAL__Effects } from './store/__FEATURE__.effects';

@NgModule({
  declarations: [
    // TODO: add generated page, container, components and dialogs
  ],
  imports: [
    CommonModule,
    __FEATURE_PASCAL__RoutingModule,
    StoreModule.forFeature(__FEATURE_CAMEL__FeatureKey, __FEATURE_CAMEL__Reducer),
    EffectsModule.forFeature([__FEATURE_PASCAL__Effects])
  ]
})
export class __FEATURE_PASCAL__Module {}
