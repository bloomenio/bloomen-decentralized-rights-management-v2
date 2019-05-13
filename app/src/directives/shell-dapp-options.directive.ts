import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[bloButtonsHost]'
})
export class BloButtonsHostDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}
