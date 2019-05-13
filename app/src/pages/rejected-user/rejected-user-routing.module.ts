import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@services/i18n/i18n.service';
import { RejectedUserComponent } from './rejected-user.component';


const routes: Routes = [
    {
      path: '',
      component: RejectedUserComponent,
      data: {
        title: extract('rejected user')
      }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class RejectedUserRoutingModule { }
