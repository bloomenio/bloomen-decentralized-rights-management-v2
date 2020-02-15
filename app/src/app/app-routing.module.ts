import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { GuardAuthRouteService } from '@services/guard-auth-route/guard-auth-route';
import { GuardUserAdminRouteService } from '@services/guard-user-admin-route/guard-user-admin-route';
import { GuardSuperAdminRouteService } from '@services/guard-superadmin-route/guard-superadmin-route';
import { GuardAdminRouteService } from '@services/guard-admin-route/guard-admin-route';

const routes: Routes = [
  // NOT PROTECTED
  {
    path: 'login',
    loadChildren: 'pages/login/login.module#LoginModule',
  },
  {
    path: 'restore-account',
    loadChildren: 'pages/restore-account/restore-account.module#RestoreAccountModule',
  },
  {
    path: 'waiting-approve',
    loadChildren: 'pages/waiting-approve/waiting-approve.module#WaitingApproveModule',
  },
  {
    path: 'user-form',
    loadChildren: 'pages/user-form/user-form.module#UserFormModule',
  },
  {
    path: 'rejected-user',
    loadChildren: 'pages/rejected-user/rejected-user.module#RejectedUserModule'
  },

  // PROTECTED
  {
    path: 'repertoire',
    loadChildren: 'pages/repertoire/repertoire.module#RepertoireModule',
    canActivate: [GuardAuthRouteService]
  },
  {
    path: 'claims',
    loadChildren: 'pages/claims/claims.module#ClaimsModule',
    canActivate: [GuardAuthRouteService]
  },
  {
    path: 'member-management',
    loadChildren: 'pages/member-management/member-management.module#MemberManagementModule',
    canActivate: [GuardAuthRouteService, GuardSuperAdminRouteService]
  },
  {
    path: 'user-management',
    loadChildren: 'pages/user-management/user-management.module#UserManagementModule',
    canActivate: [GuardAuthRouteService, GuardAdminRouteService]
  },

  // Fallback when no prior route is matched
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      useHash: true
    })
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
