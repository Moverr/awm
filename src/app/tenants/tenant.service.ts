import { Injectable }                from '@angular/core';
import { Headers,RequestOptions,Http }    from '@angular/http';

import { Observable }                from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

import { Tenant }                    from './tenant';
import { TENANTS }                   from './mock-tenants';
 

@Injectable()
export class TenantService {

  tenant:Tenant;

  private headers = new Headers({'Content-Type': 'application/json'});
  private url =`http://cockpit.awamo360.com/tenant/v1d/checkTenant`;



  constructor(private http: Http){}

   verifyTenant(tenantId:string) : Promise<Tenant>{

     //add the dam headders 
     let headers = new Headers(
       {'tenantId':tenantId.trim()}
       );
     let options = new RequestOptions({headers:headers})

     console.log(this.headers);
     console.log("URL "+this.url);
     

     return this.http.post(this.url,{tenantId},options)
               .toPromise()
               .then(this.openLogin)
               .catch(this.handleError);
   }

   private openLogin(){
     alert("Moerea enaneiae aea");

   }

   private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }


 
}


/*
  Author: Muyinda Rogers
  coopyright:awamo cockpit 
  year 2017
  month FEb 20th
*/