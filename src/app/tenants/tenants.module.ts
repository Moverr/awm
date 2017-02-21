import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { FormsModule }              from '@angular/forms';

import { VerifyTenantComponent }    from './verify-tenant.component';
import { AddonsModule }          from '../addons/header.module';

import { TenantRoutingModule }       from './tenants-routing.module';



@NgModule({
  imports: [  CommonModule,  FormsModule,  TenantRoutingModule,    AddonsModule  ],
  declarations: [  VerifyTenantComponent  ],
  exports:[VerifyTenantComponent]

  //providers: [ TenantRoutingModule ]

})
export class TenantsModule {}

/*  Removed the Child Routing from independenent Modules and added them to the central routing 

/*
Copyright 2017 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/