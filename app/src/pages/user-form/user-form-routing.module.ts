import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@services/i18n/i18n.service';
import { UserFormComponent } from './user-form.component';


const routes: Routes = [
    {
      path: '',
      component: UserFormComponent,
      data: {
        title: extract('User form')
      }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class UserFormRoutingModule { }
