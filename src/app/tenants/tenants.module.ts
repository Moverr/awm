import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { FormsModule }              from '@angular/forms';

import { VerifyTenantComponent }    from './verify-tenant.component';
import { HeaderComponent }          from '../addons/header.component';

// import { TenantService }             from './tenant.service';

import { TenantRoutingModule }       from './tenants-routing.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TenantRoutingModule
  ],

  declarations: [
    VerifyTenantComponent,HeaderComponent
  ],
  entryComponents: [HeaderComponent],

  providers: [ TenantRoutingModule ]
})
export class TenantsModule {}


/*
Copyright 2017 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/