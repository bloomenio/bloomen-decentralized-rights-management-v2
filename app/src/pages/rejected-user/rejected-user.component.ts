// Basic
import { Component } from '@angular/core';

import { MatSnackBar } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';

const log = new Logger('waiting-approve.component');


/**
 * Waiting approve page
 */
@Component({
  selector: 'blo-rejected-user',
  templateUrl: './rejected-user.component.html',
  styleUrls: ['./rejected-user.component.scss']
})
export class RejectedUserComponent {

  constructor(
    public snackBar: MatSnackBar,
    public router: Router
  ) { }

  public goLogin() {
    this.router.navigate(['login']);
  }
}
