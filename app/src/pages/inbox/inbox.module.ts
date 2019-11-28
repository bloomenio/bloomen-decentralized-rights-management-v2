// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@app/material.module';
import { InboxRoutingModule } from './inbox-routing.module';
import { ShellModule } from '@shell/shell.module';

// Inbox
import { InboxComponent } from './inbox.component';

// Services
import { UserProfileShellModule } from '@components/user-profile-shell/user-profile-shell.module';

// Components
import { InboxItemListModule } from '@components/inbox-item-list/inbox-item-list.module';
import { InboxDetailModule } from '@components/inbox-detail/inbox-detail.module';
import {ShellComponent} from '@shell/shell.component';

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
    InboxRoutingModule,
    InboxItemListModule,
    ShellModule,
    UserProfileShellModule,
    InboxDetailModule
  ],
  declarations: [InboxComponent],
  providers: [ShellComponent]
})
export class InboxModule { }
