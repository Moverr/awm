// TODO SOMEDAY: Feature Componetized like CrisisCenter
import 'rxjs/add/operator/switchMap';
import { Observable } 				from 'rxjs/Observable';
import { Component, OnInit } 		from '@angular/core';

import { Router } 					from '@angular/router';

import { Tenant } 					from './tenant'
import { TenantService } 			from './tenant.service';



@Component({
  selector : 'my-app',
  templateUrl: './verify-tenant.view.html',
  providers: [TenantService]

})



export class VerifyTenantComponent implements OnInit{
	title = "Mover De Movers";
	tenants:Tenant[];

	tenant  :Tenant;
	formsubmitted :boolean = false;


	constructor(private tenantService: TenantService ){}

	getTenants():void{}

	// Initialize the Tenant Object to null
	ngOnInit():void{
		//console.log("welcome HOme MOvers");
		this.tenant = new Tenant(1,"");
	}


	// Verify CLient 
	verifyTenant = function(tenantId:string){
		console.log(tenantId);


		tenantId = tenantId.trim();
		if(!tenantId){
			return ;
		}
		this.tenantService.verifyTenant(tenantId)
			.then( console.log("Mover Ya d Baddest"));



	// //TODO : Pass details to the SErvice to Check if the client is verified
	//  this.formsubmitted = true;
	//  //proccess client
	//  console.log("Process CLient");
	//  // Call a service and pass on the data ;
	//  this.tenantService.getTenantByName(this.tenant.tenantId);


	}

	get diagnostic(){
		return  JSON.stringify(this.tenant);
	}

   
}


/*
Copyright 2017 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/