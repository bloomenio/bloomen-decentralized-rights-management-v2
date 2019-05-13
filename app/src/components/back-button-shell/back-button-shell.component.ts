// Basic
import { Component } from '@angular/core';
import { Location } from '@angular/common';

/**
 * Home-options-shell component
 */
@Component({
  selector: 'blo-back-button-shell',
  templateUrl: 'back-button-shell.component.html',
  styleUrls: ['back-button-shell.component.scss']
})
export class BackButtonShellComponent {

  constructor(
    private location: Location
  ) { }

  public goBack() {
    this.location.back();
  }

}
