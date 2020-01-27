// Basic
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { INBOX } from '@core/constants/inbox.constants';
import { ClaimModel } from '@core/models/claim.model';
import * as fromUserSelectors from '@stores/user/user.selectors';
import {first, skipWhile} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {UserModel} from '@models/user.model';
import {Store} from '@ngrx/store';
import {isUpperCase} from 'tslint/lib/utils';
import {InboxComponent} from '@pages/inbox/inbox.component';


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
      public store: Store<any>,
      public inboxComponent: InboxComponent
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
    if (this.message.read !== true) {
      this.message.read = true;
      this.inboxComponent.markAsRead(this.message.creationDate, (this.message.claimId ? this.message.claimId : this.message.firstName));
      // this.message.push({ 'read': true});  // The message was just read.
      // console.log('The message was just read.');
    }
    // console.log(this.message[this.message.length - 1]);
    // console.log('message');
    // console.log(this.message);
    this.messageSelected.emit(this.message);
  }

}
