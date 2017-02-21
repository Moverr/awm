import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { FormsModule }              from '@angular/forms';

import { UserLogin }                from './user-login';
import { HeaderComponent }          from '../addons/header.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],

  declarations: [
    UserLogin,HeaderComponent
  ],
  entryComponents: [HeaderComponent]

  //providers: [ TenantRoutingModule ]

})
export class UserModule {}

/*  AUTHOR: Muyinda Rogers
    AWAMO COckpit 
    
/*
Copyright 2017 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/