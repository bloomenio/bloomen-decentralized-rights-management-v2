import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BloButtonsHostDirective } from './shell-dapp-options.directive';
import { BloBackButtonHostDirective } from './shell-back-button.directive';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [BloButtonsHostDirective, BloBackButtonHostDirective],
    exports: [BloButtonsHostDirective, BloBackButtonHostDirective]
})
export class DirectivesModule { }
