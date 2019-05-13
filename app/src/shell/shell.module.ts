import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '@app/material.module';

import { ShellComponent } from './shell.component';
import { SharedModule } from '@shared/shared.module';

import { DirectivesModule } from '@directives/directives.module';

import { BackButtonShellModule } from '@components/back-button-shell/back-button-shell.module';
import { AddMemberDialogModule } from '@components/add-member-dialog/add-member-dialog.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FlexLayoutModule,
    MaterialModule,
    RouterModule,
    BackButtonShellModule,
    SharedModule,
    DirectivesModule,
    AddMemberDialogModule
  ],
  declarations: [ShellComponent]
})
export class ShellModule { }
