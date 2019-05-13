// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@app/material.module';
import { RepertoireRoutingModule } from './repertoire-routing.module';
import { ShellModule } from '@shell/shell.module';

// Inbox
import { RepertoireComponent } from './repertoire.component';
import { RepertoireSearchModule } from '@components/repertoire-search/repertoire-search.module';

// Services
import { UserProfileShellModule } from '@components/user-profile-shell/user-profile-shell.module';

// Components
import { AssetCardModule } from '@components/asset-card/asset-card.module';

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
    RepertoireRoutingModule,
    RepertoireSearchModule,
    ShellModule,
    UserProfileShellModule,
    AssetCardModule
  ],
  declarations: [RepertoireComponent]
})
export class RepertoireModule { }
