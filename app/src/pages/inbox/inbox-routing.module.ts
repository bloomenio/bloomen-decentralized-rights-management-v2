import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@services/i18n/i18n.service';
import { InboxComponent } from './inbox.component';
import { Shell } from '@shell/shell.service';
import { UserProfileShellComponent } from '@components/user-profile-shell/user-profile-shell.component';
import { GuardAuthRouteService } from '@services/guard-auth-route/guard-auth-route';


const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: '/inbox', pathMatch: 'full' },
    {
      path: 'inbox',
      component: InboxComponent,
      data: {
        title: extract('Inbox'),
        shellOptions: {
          hasBackButton: false,
          auxiliarOptionsComponent: UserProfileShellComponent
        }
      },
      canActivate: [GuardAuthRouteService]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class InboxRoutingModule { }
