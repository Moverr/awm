import { Injectable } from '@angular/core';



@Injectable()
export class UtiltiesService {
   host:string = "";

   getHost(hostName:string){
       switch(hostName){
           case 'localhost':
            this.host = window.location.protocol+"//localhost:6789";
           break;
           case 'tpe':
            this.host = window.location.protocol+"//tpe.awamo360.com";
           break;
           case 'localhost':
            this.host = window.location.protocol+"//cockpit.awamo360.com";
           break;
           default:
            this.host = window.location.protocol+"//tpe.awamo360.com";
           break;
       }
       console.log("HOST"+this.host);
       return this.host;
   }

   // Just for Logging Purposes 
   logger = function(message:string){
       console.log(message);
   }
}

