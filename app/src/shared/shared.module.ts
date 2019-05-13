import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '@app/material.module';
import { LoaderComponent } from './loader/loader.component';

import { LottieAnimationViewModule } from 'ng-lottie';

@NgModule({
  imports: [
    FlexLayoutModule,
    MaterialModule,
    CommonModule,
    FormsModule,
    LottieAnimationViewModule.forRoot()
  ],
  declarations: [LoaderComponent],
  exports: [
    LoaderComponent,
    FormsModule
  ]
})
export class SharedModule {}
