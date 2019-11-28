pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../../node_modules/solidity-rlp/contracts/RLPReader.sol";
import "./Users.sol";
import "./Claims.sol";

contract Lib is Users {

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
//    uint48[] log;
//    uint16 log2;
//    string log3;
  }

  //  uint256 constant private PAGE_SIZE = 10;

  mapping (uint256 => Claim) internal claims_;
  mapping (uint256 => uint16) internal maxSplits_;

  uint256 internal claimIdCounter_ = 0;
  // METHODS

  // Public
  function checkClaimStatus(uint256 _claimId, bool _claimType, bytes _claimData, bool newClaim) internal {
// scenario claimData sto app, multiple variables sto blockchain
//   change integration tou claimsContracts.ts (eisagwgh sto blockchain) EASY kai opou ginetai exagwgh apo blockchain
//   struct Claim {
//    countries: string[]
//    startDate, endDate: uint
//    types (useTypes/rightTypes): string[]
//    rightHolderRoles: string or not
    RLPReader.RLPItem memory item = _claimData.toRlpItem();
    RLPReader.RLPItem[] memory itemList = item.toList();  // ((name0, value0), (name, value), (name, value), ...)
    uint16 split = uint16(bytesToUint(itemList[5].toList()[1].toBytes()));
    uint48 startDate = uint48(bytesToUint(itemList[2].toList()[1].toBytes()));
    uint48 endDate = uint48(bytesToUint(itemList[3].toList()[1].toBytes()));

//    claims_[_claimId].log.push(uint48(bytesToUint(string(itemList[2].toList()[1].toBytes()))));
//    claims_[_claimId].log.push(uint48(bytesToUint(string(itemList[3].toList()[1].toBytes()))));
    maxSplits_[_claimId]=split;
    bool prevStatus = claims_[_claimId].status;
    bool tempMaxSplitOnce = true;
    for(uint256 i = 1; i <= claimIdCounter_; i++) {
      if (_claimType == claims_[i].claimType && _claimId != i) {
        if(keccak256(itemList[0].toList()[1].toBytes()) == keccak256(claims_[i].claimData[0].value) // same ISRC/ISWC
        && keccak256(itemList[1].toList()[1].toBytes()) == keccak256(claims_[i].claimData[1].value) // same countries
        && endDate >= uint48(bytesToUint(bytes(claims_[i].claimData[2].value))) // must check end1 >= start2
        && startDate <= uint48(bytesToUint(bytes(claims_[i].claimData[3].value))) // must check start1 <= end2
        && keccak256(itemList[4].toList()[1].toBytes()) == keccak256(claims_[i].claimData[4].value) // same useTypes/rightTypes
        ){
//          claims_[i].log.push(uint48(bytesToUint(bytes(claims_[i].claimData[2].value))));
//          claims_[i].log.push(uint48(bytesToUint(bytes(claims_[i].claimData[3].value))));
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
        }
      }
    }
  }

//  function translateRLPUint(uint16 _number) private pure returns (uint16) {
//
//    if (_number > 12591) {
//      //      uint16 dec = (split-48)/256-48;
//      //      split = ((split-48)/256-48)*10+split-12544-(((split-48)/256-48)-1)*256-48;
//      return _number -246*((_number-48)/256-48)-12336;
//    } else if (_number < 58) {
//      return _number-48;
//    } else { // if (_number == 12336)
//      return 100;
//    }
//  }

  function bytesToUint(bytes s) private constant returns (uint result) {
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