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

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    FlexLayoutModule,
    MaterialModule,
  ],
  declarations: [InboxItemListComponent],
  exports: [InboxItemListComponent],
  entryComponents: [InboxItemListComponent]
})
export class InboxItemListModule { }
