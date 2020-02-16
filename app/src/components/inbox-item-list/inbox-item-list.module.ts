// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { MaterialModule } from '@app/material.module';

// Components
import { InboxItemListComponent } from './inbox-item-list.component';
import {AssetCardReadOnlyModule} from '@components/asset-card-readOnly/asset-card-readOnly.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    FlexLayoutModule,
    MaterialModule,
    AssetCardReadOnlyModule
  ],
  declarations: [InboxItemListComponent],
  exports: [InboxItemListComponent],
  entryComponents: [InboxItemListComponent]
})
export class InboxItemListModule { }
