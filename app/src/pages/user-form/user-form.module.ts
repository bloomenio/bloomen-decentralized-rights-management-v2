// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@app/material.module';
import { UserFormRoutingModule } from './user-form-routing.module';
import { ShellModule } from '@shell/shell.module';

// Inbox
import { UserFormComponent } from './user-form.component';

// Services
import { UserProfileShellModule } from '@components/user-profile-shell/user-profile-shell.module';

// Components
import { InboxItemListModule } from '@components/inbox-item-list/inbox-item-list.module';
import { InboxDetailModule } from '@components/inbox-detail/inbox-detail.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';

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
    UserFormRoutingModule,
    InboxItemListModule,
    ShellModule,
    UserProfileShellModule,
    InboxDetailModule,
    ReactiveFormsModule,
    NgxMatFileInputModule
  ],
  declarations: [UserFormComponent]
})
export class UserFormModule { }
