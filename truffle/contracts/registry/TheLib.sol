pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../../node_modules/solidity-rlp/contracts/RLPReader.sol";

contract TheLib {

  using RLPReader for bytes;
  using RLPReader for uint;
  using RLPReader for RLPReader.RLPItem;

  enum StatusClaimEnum {
    CLAIMED,
    CONFLICT
  }

  enum ClaimTypeEnum {
    MUSICAL_WORK,
    SOUND_RECORDING
  }
  
  struct NameValue{ 
    string name;
    string value;
  }

  struct Claim {   
    uint256 creationDate;
    uint256 claimId;
    NameValue[] claimData;
    ClaimTypeEnum claimType;    
    uint256 memberOwner;    //  replace with 'member'
    uint256 memberReceptor; // remove
    string[] messageLog;
    StatusClaimEnum status;
    uint256 lastChange;   
  }

  uint256 constant private PAGE_SIZE = 10;

  mapping (uint256 => Claim) private claims_;
  uint256 private claimIdCounter_ = 0;
  // METHODS

  // Public
  function checkClaimStatus(uint256 _claimId, bytes _claimData, uint256 _claimType, uint _memberOwner) public {
//     -browse all (getClaimsByISRC or ISWC) = claims_
//     -check if conflict with region, period, useTypes
//        -if CONFLICT with split
//            -change the status to conflict
//            -and if found is not CONFLICT status, then change as well
//            -_addClaimFromInbox(member, _claimId)
//            -save memberId/_claimId locally (memory)
    require(claimIdCounter_ > 0, "There is no claim in the system");
    //ISRC
    for(uint256 i = 1; i <= claimIdCounter_; i++) {
      // Sound Recording
      if (_claimType == 1 && uint256(claims_[i].claimType) == 1 && _claimId != i) {
        if (keccak256(abi.encodePacked(claims_[_claimId].claimData[6].value)) == keccak256(abi.encodePacked(claims_[i].claimData[6].value))) { // same ISRC
          claims_[_claimId].status = StatusClaimEnum.CONFLICT;
          claims_[i].status = StatusClaimEnum.CONFLICT;
//          claims_[1].messageLog.push(claims_[_claimId].claimData[3].value);
          if (strEqual(claims_[_claimId].claimData[3].value, claims_[i].claimData[3].value)) { // same countries
            if (strEqual(claims_[_claimId].claimData[4].value, claims_[i].claimData[4].value)) { // same useTypes
              if (strEqual(claims_[_claimId].claimData[0].value, claims_[i].claimData[0].value)
              && strEqual(claims_[_claimId].claimData[1].value, claims_[i].claimData[1].value)) { // same period
                if (uint256(parseInt(claims_[_claimId].claimData[2].value, 0)) + uint256(parseInt(claims_[i].claimData[2].value, 0)) > 100) { // check if their splits> 100% (checking between combinations missing!)

                }
              }
            }
          }
        }
      }
      // Musical Work
      else if (_claimType == 0 && uint256(claims_[i].claimType) == 0 && _claimId != i) {

      }
    }
    _memberOwner=1;
  }

  function strEqual(string _s1, string _s2) internal returns (bool){
    if (keccak256(abi.encodePacked(_s1)) == keccak256(abi.encodePacked(_s2))) {
      return true;
    }
    return false;
  }

  function parseInt(string _a, uint _b) internal returns (uint) {
    bytes memory bresult = bytes(_a);
    uint mint = 0;
    bool decimals = false;
    for (uint i = 0; i < bresult.length; i++) {
      if ((bresult[i] >= 48) && (bresult[i] <= 57)) {
        if (decimals) {
          if (_b == 0) break;
          else _b--;
        }
        mint *= 10;
        mint += uint(bresult[i]) - 48;
      } else if (bresult[i] == 46) decimals = true;
    }
    return mint;
  }

}
