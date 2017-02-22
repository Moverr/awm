import { NgModule }                from '@angular/core';
import { BrowserModule }           from '@angular/platform-browser';
import { FormsModule }             from '@angular/forms';
import { Router }                  from '@angular/router';
import { HttpModule }              from '@angular/http';

import { AppComponent }            from './app.component';
import { ComposeMessageComponent } from './compose-message.component';
import { LoginComponent }          from './login.component';
import { PageNotFoundComponent }   from './not-found.component';


// Routing MOdules
import { AppRoutingModule }        from './app-routing.module';
import { LoginRoutingModule }      from './login-routing.module';


import { HeroesModule }            from './heroes/heroes.module';
import { TenantsModule }           from './tenants/tenants.module';
import { UserModule }              from './user/user.module';

import {AddonsModule}              from './addons/header.module';


// Services 
import { DialogService }           from './dialog.service';

// Services 
import { UtiltiesService }           from './_services/utilities.service';
import { TenantService } 		         from './tenants/tenant.service';



@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HeroesModule,
    HttpModule,
    AddonsModule,
    TenantsModule,
    UserModule,
    //LoginRoutingModule,  
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    ComposeMessageComponent,    
    PageNotFoundComponent
  ],
  providers: [
    DialogService,UtiltiesService,TenantService
  ],
  
  bootstrap: [ AppComponent ]
})
export class AppModule {
  // Diagnostic only: inspect router configuration
  constructor(router: Router) {
    console.log('Routes: ', JSON.stringify(router.config, undefined, 2));
  }
}


/*
Copyright 2017 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/