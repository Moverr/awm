import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { VerifyTenantComponent }    from './verify-tenant.component';




const tenantsRoutes: Routes = [
  { path: '',  component: VerifyTenantComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(tenantsRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class TenantRoutingModule { }


/*
Copyright 2017 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/