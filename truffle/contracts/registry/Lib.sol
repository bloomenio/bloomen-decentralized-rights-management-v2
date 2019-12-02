pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../../node_modules/solidity-rlp/contracts/RLPReader.sol";
import "./Users.sol";
import "./Claims.sol";
import "./Lib2.sol";


contract Lib is Users, Lib2 {

  using RLPReader for bytes;
  using RLPReader for uint;
  using RLPReader for RLPReader.RLPItem;

  struct NameValue{
    string name;
    string value;
  }

  struct Claim {
    uint256 creationDate;
    uint256 claimId;        // 2^48 ~ 100 trillion claims
    NameValue[] claimData;
    bool claimType;
    uint256 memberOwner;    // 2^24 ~ 16 million members
    bool status;
    uint256 lastChange;
//    bool deleted;
//    uint48[] log;
//    uint16 log2;
//    string[] log3;
  }

  mapping (uint256 => Claim) internal claims_;
  mapping (uint256 => uint16) internal maxSplits_;

  uint256 internal claimIdCounter_ = 0; // has the number of claims

  function checkClaimStatus(uint256 _claimId, bool _claimType, bytes _claimData, bool newClaim) internal {
// scenario claimData sto app, multiple variables sto blockchain
//   change integration tou claimsContracts.ts (eisagwgh sto blockchain) EASY kai opou ginetai exagwgh apo blockchain
//   struct Claim {
//    countries: string[]
//    startDate, endDate: uint
//    types (useTypes/rightTypes): string[]
//    rightHolderRoles: string or not
//    if (newClaim) {
//      claims_[_claimId].deleted = false;
//    }
    RLPReader.RLPItem memory item = _claimData.toRlpItem();
    RLPReader.RLPItem[] memory itemList = item.toList();  // ((name0, value0), (name, value), (name, value), ...)
    uint16 split = uint16(bytesToUint(itemList[5].toList()[1].toBytes()));
    uint48 startDate = uint48(bytesToUint(itemList[2].toList()[1].toBytes()));
    uint48 endDate = uint48(bytesToUint(itemList[3].toList()[1].toBytes()));

    maxSplits_[_claimId]=split;
    bool prevStatus = claims_[_claimId].status;
    bool tempMaxSplitOnce = true;
    for(uint256 i = 1; i <= claimIdCounter_; i++) {
      if (_claimType == claims_[i].claimType && _claimId != i) {
        hasOverlapResult = false;
        if(keccak256(itemList[0].toList()[1].toBytes()) == keccak256(claims_[i].claimData[0].value) // same ISRC/ISWC
        && endDate >= uint48(bytesToUint(bytes(claims_[i].claimData[2].value))) // end1 >= start2
        && startDate <= uint48(bytesToUint(bytes(claims_[i].claimData[3].value))) // start1 <= end2
        ){
//          claims_[i].log.push(uint48(bytesToUint(bytes(claims_[i].claimData[2].value))));
//          claims_[i].log.push(uint48(bytesToUint(bytes(claims_[i].claimData[3].value))));
          hasOverlap(itemList[4].toList()[1].toBytes(), bytes(claims_[i].claimData[4].value)); // have at least one common useTypes/rightTypes
          if (hasOverlapResult) {
            hasOverlap(itemList[1].toList()[1].toBytes(), bytes(claims_[i].claimData[1].value)); // contain at least one common territory
            if (hasOverlapResult) {
              if (newClaim) {
                maxSplits_[i]+=split;                // build maxSplits_[i]
                if (maxSplits_[i]>100) {
                  if (!prevStatus) {
                    claims_[_claimId].status = true; // true, means there IS a CONFLICT
                    _addClaimFromInbox(claims_[_claimId].memberOwner, _claimId);
                    prevStatus = true;
                  }
                  if (!claims_[i].status) {
                    _addClaimFromInbox(claims_[i].memberOwner, claims_[i].claimId);
                    claims_[i].status = true;
                  }
                }
              } else {
                maxSplits_[i]-=split;
                if (maxSplits_[i]<=100) {
                  if (prevStatus) {
                    claims_[_claimId].status = false;
                    _removeClaimFromInbox(claims_[_claimId].memberOwner, _claimId);
                    prevStatus = false;
                  }
                  if (claims_[i].status) {
                    _removeClaimFromInbox(claims_[i].memberOwner, claims_[i].claimId);
                    claims_[i].status = false;
                  }
                }
              }
              if (tempMaxSplitOnce) {
                maxSplits_[_claimId]=maxSplits_[i];
                tempMaxSplitOnce=false;
              }
            }  // hasOverlapResult
          } // hasOverlapResult
        }
      }
    }
  }

  function bytesToUint(bytes s) private pure returns (uint result) {
    bytes memory b = s;
    uint i;
    result = 0;
    for (i = 0; i < b.length; i++) {
      uint c = uint(b[i]);
      if (c >= 48 && c <= 57) {
        result = result * 10 + (c - 48);
      }
    }
  }
}