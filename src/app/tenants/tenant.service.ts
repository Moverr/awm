import { Injectable }                from '@angular/core';
import { Headers,RequestOptions,Http,Response }    from '@angular/http';

import { Observable }                from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';


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

   verifyTenant(tenantId:string) : Observable<Tenant>{

     //add the dam headders 
     let headers = new Headers(
       {'tenantId':tenantId.trim()}
       );
       this.tenantId = tenantId.trim();
       this.tenant['tenantId'] = this.tenantId;
      // this.initialize_tenant(new Tenant(id:1,'tenantId':this.tenantId));
      console.log(this.tenant);
       
     let options = new RequestOptions({headers:headers})

     console.log(this.headers);
     console.log("URL "+this.url);
     

     return this.http.post(this.url,{options},options)
               .map(this.tenantExists)
               .catch(this.handleError);

   }

   private tenantExists(res : Response){
     
     let body = res.json();
     return body.data || {} ;
    
   }


   private handleError(error:Response | any) {
     let  errMsg: string;
     if(error instanceof Response){
       const body = error.json() || '';
       const err  = body.error   || JSON.stringify(body);
       errMsg = `${error.status} - ${error.statusText || '' } ${err}`; 
     }
     else{
       errMsg = error.message ? error.message :  error.toString();
     }
     console.log(errMsg);
     return Observable.throw(errMsg);
  }


 
}


/*
  Author: Muyinda Rogers
  coopyright:awamo cockpit 
  year 2017
  month FEb 20th
*/