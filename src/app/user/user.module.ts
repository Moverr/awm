import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { FormsModule }              from '@angular/forms';
import { AddonsModule }          from '../addons/header.module';

import { UserLoginComponent }                from './user-login.component';


// services
import {TenantService}              from '../tenants/tenant.service'



@NgModule({
  imports: [ CommonModule, FormsModule, AddonsModule ],
  declarations: [ UserLoginComponent ],  
  exports   : [UserLoginComponent]

  

})
export class UserModule {}

/*  AUTHOR: Muyinda Rogers
    AWAMO COckpit 
    
/*
Copyright 2017 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/