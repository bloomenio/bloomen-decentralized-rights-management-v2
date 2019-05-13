import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@services/i18n/i18n.service';
import { RestoreAccountComponent } from './restore-account.component';


const routes: Routes = [
    {
      path: '',
      component: RestoreAccountComponent,
      data: {
        title: extract('Restore account')
      }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class RestoreAccountRoutingModule { }
