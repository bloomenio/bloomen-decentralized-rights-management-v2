// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { MaterialModule } from '@app/material.module';

// Components
import { ReactiveFormsModule } from '@angular/forms';

import {DeleteClaimComponent} from '@components/delete-claim/delete-claim.component';



@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FlexLayoutModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  declarations: [DeleteClaimComponent],
  exports: [DeleteClaimComponent],
  entryComponents: [DeleteClaimComponent]

})
export class DeleteClaimModule { }
