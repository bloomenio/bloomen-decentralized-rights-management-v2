// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@app/material.module';
import { WaitingApproveRoutingModule } from './waiting-approve-routing.module';
import { ShellModule } from '@shell/shell.module';

// Inbox
import { WaitingApproveComponent } from './waiting-approve.component';

// Services
import { UserProfileShellModule } from '@components/user-profile-shell/user-profile-shell.module';

// Components
import { InboxItemListModule } from '@components/inbox-item-list/inbox-item-list.module';
import { InboxDetailModule } from '@components/inbox-detail/inbox-detail.module';

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
    WaitingApproveRoutingModule,
    InboxItemListModule,
    ShellModule,
    UserProfileShellModule,
    InboxDetailModule
  ],
  declarations: [WaitingApproveComponent]
})
export class WaitingApproveModule { }
