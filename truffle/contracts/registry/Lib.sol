pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../../node_modules/solidity-rlp/contracts/RLPReader.sol";
import "./Users.sol";
import "./Claims.sol";

contract Lib is Users {

  using RLPReader for bytes;
  using RLPReader for uint;
  using RLPReader for RLPReader.RLPItem;

  //  enum StatusClaimEnum {
  //    CLAIMED, // = false, means there is NO CONFLICT
  //    CONFLICT // = true, means there IS a CONFLICT
  //  }

  //  enum ClaimTypeEnum {
  //    MUSICAL_WORK,   // false for Musical Works
  //    SOUND_RECORDING // true for Sound Recordings
  //  }

  struct NameValue{
    string name;
    string value;
  }

  struct Claim {
    uint256 creationDate;
    uint256 claimId; // 2^48 ~ 100 trillion claims
    NameValue[] claimData;
    bool claimType;
    uint256 memberOwner;    // 2^24 ~ 16 million members
    bool status;
    uint256 lastChange;
//    string[] log;
//    uint16[] log2;
  }

//  uint256 constant private PAGE_SIZE = 10;

  mapping (uint256 => Claim) public claims_;
  mapping (uint256 => uint16) private maxSplits_;

  uint256 public claimIdCounter_ = 0;
  // METHODS

  // Public
  function checkClaimStatus(uint256 _claimId, bool _claimType, bytes _claimData) public {
    //            -_addClaimFromInbox(member, _claimId)
    //            -save memberId/_claimId storage 'maxSplits_'
    //            -change CONFLICT->CLAIMED if updateClaim() results like this.
//    require(claimIdCounter_ > 0, "There is no claim in the system");
    RLPReader.RLPItem memory item = _claimData.toRlpItem();
    RLPReader.RLPItem[] memory itemList = item.toList();  // ((name0, value0), (name, value), (name, value), ...)
    uint16 split = uint16(itemList[5].toList()[1].toUint());
//    claims_[_claimId].log.push(string(itemList[5].toList()[1].toBytes()));
//    claims_[_claimId].log2.push(uint16(itemList[5].toList()[1].toUint()));
//    maxSplits_[_claimId]=split;
    bool tempMaxSplitOnce = true;
    for(uint256 i = 1; i <= claimIdCounter_; i++) {
      if (_claimType == claims_[i].claimType && _claimId != i) {
        if(keccak256(abi.encodePacked(itemList[0].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[0].value)) // same ISRC/ISWC
        && keccak256(abi.encodePacked(itemList[1].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[1].value)) // same countries
        && keccak256(abi.encodePacked(itemList[2].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[2].value)) // same startDate
        && keccak256(abi.encodePacked(itemList[3].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[3].value)) // same endDate
        && keccak256(abi.encodePacked(itemList[4].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[4].value)) // same useTypes/rightTypes
        ){
          // split convert to uint16
//          claims_[i].log.push(split);
//          claims_[i].log.push(maxSplits_[i]);
//          claims_[i].log.push(maxSplits_[i]);
//          claims_[i].log2.push(split);
//          claims_[i].log.push(string(itemList[5].toList()[0].toBytes()));
//          claims_[i].log.push(string(itemList[5].toList()[1].toBytes()));

          maxSplits_[i]+=split;                // build maxSplits_[i]
          if (tempMaxSplitOnce) {
            maxSplits_[_claimId]=maxSplits_[i];
            tempMaxSplitOnce=false;
          }
          if (maxSplits_[i]>100) {
            claims_[_claimId].status = true; // true, means there IS a CONFLICT
            if (!claims_[i].status) {
              _addClaimFromInbox(claims_[i].memberOwner, _claimId);
              claims_[i].status = true;
            }
          }
        }
      }
    }
//   } else {   // when updating
//
//   }
  }

//  function updateClaimStatus(uint256 _claimId) {
//
//    uint16 split_i = 0;
//    bytes b = bytes(claims_[i].claimData[5].value);
//    for(uint16 j=0;j<b.length;j++){
//      split_i = uint16(split_i + uint16(b[j])*(2**(8*(b.length-(j+1)))));
//    }
//    maxSplits_[_claimId]+=split_i;
//
//  }

}
