// Basic
import {default as loadInBatchJSON} from './json/loadinBatchFile.json';
import {Component, Input, OnInit} from '@angular/core';
import {MatDialog, MatExpansionPanel} from '@angular/material';
import {MemberModel} from '@core/models/member.model';
import {Logger} from '@services/logger/logger.service';
import {ClaimModel} from '@core/models/claim.model';
import {SoundDialogComponent} from '@components/claim-dialog/sound-dialog/sound-dialog.component';
import {MusicalDialogComponent} from '@components/claim-dialog/musical-dialog/musical-dialog.component';
import {ClaimsContract} from '@core/core.module';
import {ASSET} from '@core/constants/assets.constants';
import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {first, reduce, skipWhile} from 'rxjs/operators';
import * as fromUserSelectors from '@stores/user/user.selectors';
import {UserModel} from '@core/models/user.model';
import ClaimTypeEnum = ClaimModel.ClaimTypeEnum;
import {globalAllAssets} from '@core/core.module';

const log = new Logger('assets-card.component');

/**
 * Home-options-shell component
 */
@Component({
  selector: 'blo-asset-card',
  templateUrl: 'asset-card.component.html',
  styleUrls: ['asset-card.component.scss']
})
export class AssetCardComponent implements OnInit {

  // private members: MemberModel[];
  public cmos: string[];

  public membersFiltered: MemberModel[];

  public roles: string[];

  public member$: Subscription;
  public cmos$: Subscription;

  public expanded: Boolean;
  public user: UserModel;

  @Input() public asset: any;
  @Input() public members: MemberModel[];

  private user$: Subscription;

  constructor(
    private store: Store<any>,
    private dialog: MatDialog,
    private claimsContract: ClaimsContract
  ) { }

  public ngOnInit() {
    this.expanded = false;
    this.user$ = this.store.select(fromUserSelectors.getUser).pipe(
      skipWhile(user => !user),
      first()
    ).subscribe((user) => {
      this.user = user;
    });

    /* Programmer enables loading in batch several claims by:
    *   - filling claims as in 'loadinBatchFile.json' and
    *   - setting below 'const loadInBatch = true'.
    *  Now, when typing a letter in repertoire search, claims in './json/loadinBatchFile.json'
    *  are submitted on the blockchain one-by-one through 'this.user'.
    */
    const loadInBatch = false;
    if (loadInBatch) {
      this.loadInBatch().then(); // check below
    }
  }

  // tslint:disable-next-line:use-life-cycle-interface
  public ngOnDestroy() {
    if (this.user$) {
      this.user$.unsubscribe();
    }
  }

  public expandPanel(matExpansionPanel: MatExpansionPanel, event: Event) {
    event.stopPropagation();

    if (!this._isExpansionIndicator(event.target)) {
      matExpansionPanel.close();
    }
  }

  private _isExpansionIndicator(target: any): boolean {
    const expansionIndicatorClass = 'mat-expansion-indicator';
    return (target.classList && target.classList.contains(expansionIndicatorClass));
  }

  public changeStateAccordion($event: Event) {
    $event.stopPropagation();
    this.expanded = !this.expanded;
  }

  public claim() {
    let dialog: any;

    console.log('user.memberId in CLAIM');
    console.log(this.user.memberId);
    if (this.asset.ISWC) {
        dialog = this.dialog.open(MusicalDialogComponent, {
          data: {
            claim: {
              memberOwner: this.user.memberId,
              creationDate: new Date().getTime(),
              claimType: ClaimModel.ClaimTypeEnum.MUSICAL_WORK,
              status: ClaimModel.StatusClaimEnum.CONFLICT,
              messageLog: [],
              claimData: {
                ISWC: this.asset.ISWC,
                title: this.asset.originalTitle
              }
            },
            members: this.members,
            disableMemberEdit: false,
            isEditable: true
          },
          width: '900px',
          height: '500px'
        });
    } else if (this.asset.ISRC) {

        dialog = this.dialog.open(SoundDialogComponent, {
          data: {
            claim: {
              memberOwner: this.user.memberId,
              creationDate: new Date().getTime(),
              claimType: ClaimModel.ClaimTypeEnum.SOUND_RECORDING,
              status: ClaimModel.StatusClaimEnum.CONFLICT,
              messageLog: [],
              claimData: {
                ISRC: this.asset.ISRC,
                title: this.asset.title
              }
            },
            members: this.members,
            disableMemberEdit: false,
            isEditable: true
          },
          width: '900px',
          height: '500px'
        });
    }

    dialog.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result) {
        this.claimsContract.addClaim(result).then();
      }
    });
  }

  public async loadInBatch() {
    console.log('this.members[0].memberId: ' + this.members[0].memberId);
    const memberOwner = this.members[0].memberId;
    // const res = await fetch(loadInBatchJSON);
    const inputJSONData = await loadInBatchJSON;
    for (const cl of inputJSONData) {
      let c: ClaimModel;
      switch (cl.claimType) {
        case 'SOUND_RECORDING': {
          console.log('cl.claimType: ' + cl.claimType);
          c = {
                creationDate: new Date().getTime(),
                claimId: undefined,
                claimType: ClaimTypeEnum.SOUND_RECORDING,
                memberOwner: memberOwner,
                status: ClaimModel.StatusClaimEnum.CONFLICT,
                oldClaimData: [
                  ['ISRC', cl.claimData.ISRC],
                  ['countries', cl.claimData.countries],
                  ['startDate', cl.claimData.startDate],
                  ['endDate', cl.claimData.endDate],
                  ['useTypes', cl.claimData.useTypes],
                  ['splitPart', cl.claimData.splitPart],
                  ['rightHolderProprietaryID', cl.claimData.rightHolderProprietaryID],
                  ['title', cl.claimData.title]
                ],
                claimData: [
                  ['ISRC', cl.claimData.ISRC],
                  ['countries', cl.claimData.countries],
                  ['startDate', cl.claimData.startDate],
                  ['endDate', cl.claimData.endDate],
                  ['useTypes', cl.claimData.useTypes],
                  ['splitPart', cl.claimData.splitPart],
                  ['rightHolderProprietaryID', cl.claimData.rightHolderProprietaryID],
                  ['title', cl.claimData.title]
                ]
              };
          console.log('claim: ' + c);
          console.log('claim.claimData: ' + c.claimData);
          break;
        }
        case 'MUSICAL_WORK': {
          console.log('cl.claimType: ' + cl.claimType);
          c = {
                creationDate: new Date().getTime(),
                claimId: undefined,
                claimType: ClaimTypeEnum.MUSICAL_WORK,
                memberOwner: memberOwner,
                status: ClaimModel.StatusClaimEnum.CONFLICT,
                oldClaimData: [
                  ['ISWC', cl.claimData.ISWC],
                  ['countries', cl.claimData.countries],
                  ['startDate', cl.claimData.startDate],
                  ['endDate', cl.claimData.endDate],
                  ['rightTypes', cl.claimData.rightTypes],
                  ['splitPart', cl.claimData.splitPart],
                  ['rightHolderRole', cl.claimData.rightHolderRole],
                  ['rightHolderProprietaryID', cl.claimData.rightHolderProprietaryID],
                  ['title', cl.claimData.title]
                ],
                claimData: [
                  ['ISWC', cl.claimData.ISWC],
                  ['countries', cl.claimData.countries],
                  ['startDate', cl.claimData.startDate],
                  ['endDate', cl.claimData.endDate],
                  ['rightTypes', cl.claimData.rightTypes],
                  ['splitPart', cl.claimData.splitPart],
                  ['rightHolderRole', cl.claimData.rightHolderRole],
                  ['rightHolderProprietaryID', cl.claimData.rightHolderProprietaryID],
                  ['title', cl.claimData.title]
                ]
              };
          console.log('claim: ' + c);
          console.log('claim.claimData: ' + c.claimData);
          break;
        }
      }
      await this.claimsContract.addClaim(c);
    }
  }

  public async repertoireBulkUpload(uploadedCSV2JSON: any) {
    interface MyJSON {
      ISC: string;
      countries: string;
      startDate: Number;
      endDate: Number;
      types: string;
      splitPart: Number;
      rightHolderRole: string;
      rightHolderProprietaryID: Number;
      title: string;
    }
    if (globalAllAssets === undefined) {
      alert('Bloomen Decentralized Management App:\n\n\nPlease click your \'Repertoire Tab\'!\n\n' +
          'In order to fetch the appropriate decentralized user rights on assets.');
    }
    const objs = JSON.parse(uploadedCSV2JSON) as MyJSON[];
    // console.log('GLOBAL ALL ASSETS');
    // console.log(globalAllAssets);
    // console.log('OBJS: ', objs);
    // console.log('this.members[0].memberId: ' + this.user.memberId);
    let done = false;
    const memberOwner = Number(this.user.memberId);
    const claimsArray = [];
    await Promise.resolve()
        .then(() => {
          for (const cl of objs) {
            let c: ClaimModel;
            // console.log('This is claim with ISC ' + cl.ISC + ' and splitPart ' + cl.splitPart + '.');
            Promise.resolve()
                .then(() => {
                  switch (cl.rightHolderRole.length) {
                    case 0: {
                      // console.log('cl.rightHolderRole: ', cl.rightHolderRole);
                      c = {
                        creationDate: new Date().getTime(),
                        lastChange: new Date().getTime(),
                        messageLog: [''],
                        claimId: undefined,
                        claimType: ClaimTypeEnum.SOUND_RECORDING,
                        memberOwner: memberOwner,
                        status: ClaimModel.StatusClaimEnum.CLAIMED,
                        oldClaimData: [
                          ['ISRC', cl.ISC],
                          ['countries', cl.countries],
                          ['startDate', cl.startDate],
                          ['endDate', cl.endDate],
                          ['useTypes', cl.types],
                          ['splitPart', cl.splitPart],
                          ['rightHolderProprietaryID', cl.rightHolderProprietaryID],
                          ['title', cl.title]
                        ],
                        claimData: [
                          ['ISRC', cl.ISC],
                          ['countries', cl.countries],
                          ['startDate', cl.startDate],
                          ['endDate', cl.endDate],
                          ['useTypes', cl.types],
                          ['splitPart', cl.splitPart],
                          ['rightHolderProprietaryID', cl.rightHolderProprietaryID],
                          ['title', cl.title]
                        ]
                      };
                      break;
                    }
                    default: {
                      // console.log('cl.rightHolderRole: ', cl.rightHolderRole);
                      c = {
                        creationDate: new Date().getTime(),
                        lastChange: new Date().getTime(),
                        messageLog: [''],
                        claimId: undefined,
                        claimType: ClaimTypeEnum.MUSICAL_WORK,
                        memberOwner: memberOwner,
                        status: ClaimModel.StatusClaimEnum.CLAIMED,
                        oldClaimData: [
                          ['ISWC', cl.ISC],
                          ['countries', cl.countries],
                          ['startDate', cl.startDate],
                          ['endDate', cl.endDate],
                          ['rightTypes', cl.types],
                          ['splitPart', cl.splitPart],
                          ['rightHolderRole', cl.rightHolderRole],
                          ['rightHolderProprietaryID', cl.rightHolderProprietaryID],
                          ['title', cl.title]
                        ],
                        claimData: [
                          ['ISWC', cl.ISC],
                          ['countries', cl.countries],
                          ['startDate', cl.startDate],
                          ['endDate', cl.endDate],
                          ['rightTypes', cl.types],
                          ['splitPart', cl.splitPart],
                          ['rightHolderRole', cl.rightHolderRole],
                          ['rightHolderProprietaryID', cl.rightHolderProprietaryID],
                          ['title', cl.title]
                        ]
                      };
                      break;
                    }
                  }
                })
                .then(() => {
                  claimsArray.push(c);
                });
            // console.log('claimsArray: ', claimsArray);
            // console.log('c: ', c);
            // claimsArray.push(c);
            // console.log('claimsArray: ', claimsArray);
            // claimsArray.forEach((claim) => {
            //   console.log(claim.claimData);
            // });
          }
        })
        .then(async () => {
          // const claimsArray3 = [];
          // claimsArray.forEach( ({c}) => {
          //   claimsArray3.push(c);
          // });
          // console.log('claimsArray ');
          // console.log(claimsArray);
          // console.log('claimsArray3 ');
          // console.log(claimsArray3);
          // claimsArray = claimsArray3;
          // Fix random title if necessary
          await Promise.resolve('DONE')
              .then( () => {
                // let claimsArray2 = [];
                // console.log('claimsArray:');
                // console.log(claimsArray);
                // console.log(claimsArray.length);
                // console.log(claimsArray[1]);
                // console.log(claimsArray[2]);
                for (const submittedAsset of claimsArray) {
                  // for (let i = 0; i < claimsArray.length; i++) {
                  //   const submittedAsset = claimsArray[i];
                  // console.log(submittedAsset);
                  // }
                  // for (const submittedAsset of claimsArray) {
                  //   for (const realAsset of globalAllAssets) {
                  Promise.resolve('DONE')
                      .then(() => {
                        // globalAllAssets.forEach((realAsset) => {
                          // console.log(realAsset);
                          const index = claimsArray.indexOf(submittedAsset);
                          if (globalAllAssets.some(real => (real.ISRC || real.ISWC) === submittedAsset.claimData[0][1])) {
                            const realAsset = globalAllAssets.find(real => (real.ISRC || real.ISWC) === submittedAsset.claimData[0][1]);
                            // console.log(realAsset);
                            // console.log('globalAllAssets.includes(submittedAsset)');
                            // console.log(globalAllAssets.some(real => (real.ISRC || real.ISWC) === submittedAsset.claimData[0][1]));
                            // console.log((realAsset.ISRC || realAsset.ISWC), ' EQUALS ', submittedAsset.claimData[0][1]);
                            // console.log('INDEX: ', index);
                            if (realAsset.ISRC && index > -1) {
                              // console.log(realAsset.ISRC, ' is ISRC and equal with ', submittedAsset.claimData[0][1]);
                              // const index = claimsArray.indexOf(realAsset.ISRC === submittedAsset.claimData[0][1], 0);
                              claimsArray[index].claimData[7][1] = realAsset.title;
                              claimsArray[index].oldClaimData[7][1] = realAsset.title;
                            } else if (realAsset.ISWC && index > -1) {
                              // console.log(realAsset.ISWC, ' is ISWC and equal with ', submittedAsset.claimData[0][1]);
                              // const index = claimsArray.indexOf(realAsset.ISWC);
                              // console.log('index: ', index);
                              // console.log(realAsset.originalTitle);
                              // console.log(submittedAsset);
                              // console.log(index);
                              // console.log(claimsArray[index]);
                              // console.log(claimsArray[index].claimData[8][1]);
                              claimsArray[index].claimData[8][1] = realAsset.originalTitle;
                              claimsArray[index].oldClaimData[8][1] = realAsset.originalTitle;
                            }
                            // console.log('claimsArray[', index, '] = ');
                            // console.log(claimsArray[index]);
                          } else {  // Remove 'claimsArray[..]' element equal to 'submittedAsset';
                            // because the User has eventually no rights to submit this asset!
                            // let found = true;
                            // do {
                            // console.log('INDEX TO REMOVE: ', index);
                            // const index = claimsArray.indexOf(submittedAsset);
                            if (index > -1) {
                              // console.log('REMOVE claimsArray[', index, '] = ', submittedAsset);
                              const splice = claimsArray.splice(index, 1);
                              // console.log('claimsArray.splice(', index, ', 1) = ', splice);
                              // console.log('claimsArray:', claimsArray);
                              // claimsArray2 = claimsArray2.concat(splice);
                              // console.log('CLAIMS_ARRAY ITEM TO DELETE: ', claimsArray);
                              // console.log('NEW CLAIMS_ARRAY: ', claimsArray2);
                            }
                            // } else {
                            //   found = false;
                            // }
                            // } while (found);
                            // claimsArray = claimsArray2; // older
                          }
                          // }
                          // }
                          // claimsArray = claimsArray2;
                        // }
                      });
                }
              });
        })
        .then(async () => {
          if (!done) {
            done = true;
            // console.log(claimsArray);
            for (let j = 0; j < claimsArray.length; j++) {
            // for (const asset of claimsArray) {
            //   console.log(claimsArray[j]);
              // console.log(asset);
              // await this.claimsContract.addClaim(asset).then();
              await this.claimsContract.addClaim(claimsArray[j]).then();
            }
          }
        });
  }

  public async delay(ms: number) {    // await this.delay(500);
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
