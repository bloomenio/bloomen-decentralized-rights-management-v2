// Basic
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { INBOX } from '@core/constants/inbox.constants';
import { ClaimModel } from '@core/models/claim.model';
import * as fromUserSelectors from '@stores/user/user.selectors';
import {first, skipWhile} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {UserModel} from '@models/user.model';
import {Store} from '@ngrx/store';


/**
 * Home-options-shell component
 */
@Component({
  selector: 'blo-inbox-item-list',
  templateUrl: 'inbox-item-list.component.html',
  styleUrls: ['inbox-item-list.component.scss']
})
export class InboxItemListComponent implements OnInit {

  @Input() public message: any;
  @Input() public isActive: boolean;
  @Output() public readonly messageSelected = new EventEmitter();
  public inboxEnum: object;
  public claimType: any;
  private user$: Subscription;
  public user: UserModel;

  constructor(
      public store: Store<any>
  ) { }

  public ngOnInit() {
    this.inboxEnum = INBOX;
    this.claimType = ClaimModel.ClaimTypeEnum;

    this.user$ = this.store.select(fromUserSelectors.getUser).pipe(
        skipWhile(user => !user),
        first()
    ).subscribe((user) => {
      this.user = user;
    });
  }

  public onClickMessage() {
    this.messageSelected.emit(this.message);
  }

}
