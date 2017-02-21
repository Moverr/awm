// TODO SOMEDAY: Feature Componetized like CrisisCenter
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { HeaderComponent } from '../addons/header.component'


@Component({
  selector : 'my-app',
  templateUrl: './tenant-list-component.html'

})



export class TenantListComponent{

  constructor( public router: Router) {}
  clickme = function(){
    alert("Mover is bad ");

       
      this.router.navigate(['heroes']);
  }
   
}


/*
Copyright 2017 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/