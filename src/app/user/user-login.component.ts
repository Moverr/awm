// TODO SOMEDAY: Feature Componetized like CrisisCenter
import 'rxjs/add/operator/switchMap';
import { Observable } 				from 'rxjs/Observable';
import { Component, OnInit } 		from '@angular/core';

import { Router } 					from '@angular/router';

import { Tenant } 					from '../tenants/tenant'
import { TenantService } 			from '../tenants/tenant.service';



@Component({
  selector : 'my-app',
  templateUrl: './user-login.view.html',
  providers: [TenantService],

})



export class UserLoginComponent {
	 
	constructor(private tenantService: TenantService ){}

}


/*
Copyright 2017 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/