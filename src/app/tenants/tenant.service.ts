import { Injectable }                from '@angular/core';
import { Headers,RequestOptions,Http }    from '@angular/http';

import { Observable }                from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

import { Tenant }                    from './tenant';
import { TENANTS }                   from './mock-tenants';

import {UtiltiesService}             from '../_services/utilities.service'
 

@Injectable()
export class TenantService {

  tenant:Tenant;

  private headers = new Headers({'Content-Type': 'application/json'});
  private url =``;
  private endpoint :string = `/tenant/v1d/checkTenant`;

 private tenantId : string = "";

  constructor(private http: Http,private utities:UtiltiesService){
    this.url = utities.getHost('cockpit')+this.endpoint;
  }

  initialize_tenant(tenant:Tenant){
    this.tenant = tenant;
    return this.tenant;
  }

   verifyTenant(tenantId:string) : Promise<void>{

     //add the dam headders 
     let headers = new Headers(
       {'tenantId':tenantId.trim()}
       );
       this.tenantId = tenantId.trim();
     let options = new RequestOptions({headers:headers})

     console.log(this.headers);
     console.log("URL "+this.url);
     

     return this.http.post(this.url,{options},options)
               .toPromise()
               .then(this.tenantExists)
               .catch(this.handleError);

   }

   private tenantExists(){
     this.tenant.tenantId = this.tenantId;
    
   }


   private handleError(error: any): Promise<any> {
   //  console.error('An error occurred', error); // for demo purposes only
   this.tenant.tenantId = "";
    console.log("TEST : "+error.status)
    return Promise.reject(error.status);
  }


 
}


/*
  Author: Muyinda Rogers
  coopyright:awamo cockpit 
  year 2017
  month FEb 20th
*/