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
    uint256 claimId;
    NameValue[] claimData;
    bool claimType;
    uint256 memberOwner;    //  replace with 'member'
    //    uint256 memberReceptor; // remove
    //    string[] messageLog;
    bool status;
    uint256 lastChange;
  }

  uint256 constant private PAGE_SIZE = 10;

  mapping (uint256 => Claim) public claims_;
  uint256 public claimIdCounter_ = 0;
//  // METHODS

  // Public
  function checkClaimStatus(uint256 _claimId, bool _claimType, bytes _claimData) public {
    //     -browse all (getClaimsByISRC or ISWC) = claims_
    //     -check if conflict with region, period, useTypes
    //        -if CONFLICT with split
    //            -change the status to conflict
    //            -and if found is not CONFLICT status, then change as well
    //            -_addClaimFromInbox(member, _claimId)
    //            -save memberId/_claimId locally (memory)
//    require(claimIdCounter_ > 0, "There is no claim in the system");
//   if (_claimId == claimIdCounter_) {   // just registered
    // Push in messageLog of _claimId==1 the _claimData of each claim that is input in this function
    RLPReader.RLPItem memory item = _claimData.toRlpItem();
    RLPReader.RLPItem[] memory itemList = item.toList();  // ((name0, value0), (name, value), (name, value), ...)
    //    claims_[1].claimData.push(NameValue("__NEXT__", "__CLAIM"));
    //    for(uint j = 0; j < itemList.length; ++j) {
    //      //      RLPReader.RLPItem[] memory itemListClaim = itemList[j].toList(); // (name0, value0)
    //    string memory data = string(itemList[j].toList()[1].toBytes());
    //    claims_[1].claimData.push(NameValue(string(itemList[j].toList()[0].toBytes()), string(itemList[j].toList()[1].toBytes())));
    //    }
    uint8 split = uint8(itemList[5].toList()[1].toUint());
    uint[] memory memberOwners;
    for(uint256 i = 1; i <= claimIdCounter_; i++) {
      if (_claimType == claims_[i].claimType && _claimId != i) {
        if(keccak256(abi.encodePacked(itemList[0].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[0].value)) // same ISRC/ISWC
        && keccak256(abi.encodePacked(itemList[1].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[1].value)) // same countries
        && keccak256(abi.encodePacked(itemList[2].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[2].value)) // same startDate
        && keccak256(abi.encodePacked(itemList[3].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[3].value)) // same endDate
        && keccak256(abi.encodePacked(itemList[4].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[4].value)) // same useTypes/rightTypes
        ){
          // Sound Recording, _claimType = true for Sound Recordings
//          if (_claimType) {   // split convert to uint8
            uint8 split_i = 0; // bytesToUint8(bytes(claims_[i].claimData[5].value));
            bytes b = bytes(claims_[i].claimData[5].value);
            for(uint8 j=0;j<b.length;j++){
//              split_i = uint8(split_i + uint8(b[j])*(2**(8*(b.length-(j+1)))));
            }

            if (split+split_i>100) {

              claims_[_claimId].status = true; // true, means there IS a CONFLICT
              if (!claims_[i].status) {
                _addClaimFromInbox(claims_[i].memberOwner, _claimId);
              }
              claims_[i].status = true;
              //                if (uint256(parseInt(claims_[_claimId].claimData[2].value, 0)) + uint256(parseInt(claims_[i].claimData[2].value, 0)) > 100) {
              //      // check if their splits> 100% (checking between combinations missing!)
              //
              //                }
            }
            // Musical Work, _claimType = false for Musical Works
//          } else if (keccak256(abi.encodePacked(itemList[6].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[6].value))) { // same rightHolderRole

            claims_[_claimId].status = true;
            if (!claims_[i].status) {
              _addClaimFromInbox(claims_[i].memberOwner, _claimId);
            }
            claims_[i].status = true;

//          }
        }
      }
    }
//   } else {   // while updating
//
//   }
  }

//  function bytesToUint8(bytes b) internal pure returns (uint8){
//    uint8 number;
//    for(uint8 i=0;i<b.length;i++){
//      number = uint8(number + uint8(b[i])*(2**(8*(b.length-(i+1)))));
//    }
//    return number;
//  }
//
//  function stringToUint(string s) public pure returns (uint8) {
//    bytes memory b = bytes(s);
//    uint8 result = 0;
//    uint8 oldResult = 0;
//    for (uint8 i = 0; i < b.length; i++) { // c = b[i] was not needed
//      if (b[i] >= 48 && b[i] <= 57) {
//        // store old value so we can check for overflows
//        oldResult = result;
//        result = result * 10 + (uint8(b[i]) - 48); // bytes and int are not compatible with the operator -.
//        // prevent overflows
////        if(oldResult > result ) {
////          // we can only get here if the result overflowed and is smaller than last stored value
////          hasError = true;
////        }
//      }
////     else {
////        hasError = true;
////      }
//    }
//    return result;
//  }
}
