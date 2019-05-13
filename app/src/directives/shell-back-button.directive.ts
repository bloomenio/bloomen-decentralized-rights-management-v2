import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[bloBackButtonHost]'
})
export class BloBackButtonHostDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}
