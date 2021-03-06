import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@services/i18n/i18n.service';
import { MemberManagementComponent } from './member-management.component';
import { Shell } from '@shell/shell.service';
import { UserProfileShellComponent } from '@components/user-profile-shell/user-profile-shell.component';
import { GuardAuthRouteService } from '@services/guard-auth-route/guard-auth-route';


const routes: Routes = [
  Shell.childRoutes([
    {
      path: '',
      component: MemberManagementComponent,
      data: {
        title: extract('Member management'),
        shellOptions: {
          hasBackButton: false,
          auxiliarOptionsComponent: UserProfileShellComponent
        }
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class MemberManagementRoutingModule { }
