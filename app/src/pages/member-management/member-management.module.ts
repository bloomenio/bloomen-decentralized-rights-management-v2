// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@app/material.module';
import { MemberManagementRoutingModule } from './member-management-routing.module';
import { ShellModule } from '@shell/shell.module';

// Home
import { MemberManagementComponent } from './member-management.component';

// Services
import { MemberManagementDataSource } from './member-management.datasource';
import { UserProfileShellModule } from '@components/user-profile-shell/user-profile-shell.module';

/**
 * Module to import and export all the components for the home page.
 */
@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    FlexLayoutModule,
    MaterialModule,
    MemberManagementRoutingModule,
    ShellModule,
    UserProfileShellModule
  ],
  declarations: [MemberManagementComponent],
  providers: [MemberManagementDataSource]
})
export class MemberManagementModule { }
