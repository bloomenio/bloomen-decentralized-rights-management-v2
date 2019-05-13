import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@services/i18n/i18n.service';
import { WaitingApproveComponent } from './waiting-approve.component';


const routes: Routes = [
    {
      path: '',
      component: WaitingApproveComponent,
      data: {
        title: extract('waiting approve')
      }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class WaitingApproveRoutingModule { }
