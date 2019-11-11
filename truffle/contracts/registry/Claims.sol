pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../../node_modules/solidity-rlp/contracts/RLPReader.sol";
import "./Users.sol";
//import * as theLib from "./TheLib.sol";

contract Claims is Users {

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

  mapping (uint256 => Claim) private claims_;
  uint256 private claimIdCounter_ = 0;
  // METHODS

  // Public
  function checkClaimStatus(uint256 _claimId, bool _claimType, bytes _claimData) internal {
//     -browse all (getClaimsByISRC or ISWC) = claims_
//     -check if conflict with region, period, useTypes
//        -if CONFLICT with split
//            -change the status to conflict
//            -and if found is not CONFLICT status, then change as well
//            -_addClaimFromInbox(member, _claimId)
//            -save memberId/_claimId locally (memory)
    require(claimIdCounter_ > 0, "There is no claim in the system");

    // Push in messageLog of _claimId==1 the _claimData of each claim that is input in this function
    RLPReader.RLPItem memory item = _claimData.toRlpItem();
    RLPReader.RLPItem[] memory itemList = item.toList();  // ((name0, value0), (name, value), (name, value), ...)
//    claims_[1].claimData.push(NameValue("__NEXT__", "__CLAIM"));
//    for(uint j = 0; j < itemList.length; ++j) {
//      //      RLPReader.RLPItem[] memory itemListClaim = itemList[j].toList(); // (name0, value0)
//    string memory data = string(itemList[j].toList()[1].toBytes());
//    claims_[1].claimData.push(NameValue(string(itemList[j].toList()[0].toBytes()), string(itemList[j].toList()[1].toBytes())));
//    }
    uint8 _split;
    for(uint256 i = 1; i <= claimIdCounter_; i++) {
      // Sound Recording, _claimType = true
      if (_claimType == claims_[i].claimType && _claimId != i) {
        if (keccak256(abi.encodePacked(string(itemList[0].toList()[1].toBytes()))) == keccak256(abi.encodePacked(claims_[i].claimData[0].value)) // same ISRC/ISWC
         && keccak256(abi.encodePacked(string(itemList[1].toList()[1].toBytes()))) == keccak256(abi.encodePacked(claims_[i].claimData[1].value)) // same countries
         && keccak256(abi.encodePacked(string(itemList[2].toList()[1].toBytes()))) == keccak256(abi.encodePacked(claims_[i].claimData[2].value)) // same startDate
         && keccak256(abi.encodePacked(string(itemList[3].toList()[1].toBytes()))) == keccak256(abi.encodePacked(claims_[i].claimData[3].value)) // same endDate
         && keccak256(abi.encodePacked(string(itemList[4].toList()[1].toBytes()))) == keccak256(abi.encodePacked(claims_[i].claimData[4].value)) // same rightHolderProprietaryID
        ){
          if (_claimType) {   //ISRC: _claimType == true for Sound Recordings
//            string(itemList[5].toList()[1].toBytes()); // split
            claims_[_claimId].status = true;
            if (!claims_[i].status) {
              _addClaimFromInbox(claims_[i].memberOwner, _claimId);
            }
            claims_[i].status = true;
//                if (uint256(parseInt(claims_[_claimId].claimData[2].value, 0)) + uint256(parseInt(claims_[i].claimData[2].value, 0)) > 100) {
            //      // check if their splits> 100% (checking between combinations missing!)
//
//                }
////              }
          } else {

            claims_[_claimId].status = true;
            claims_[i].status = true;
          }
        }
      }
    }
  }

  function registerClaim(uint256 _creationDate, bytes _claimData, bool _claimType, uint _memberOwner) public {

    require(_creationDate > 0, "CreationDate is mandatory");
//    require(_claimType || !_claimType, "Incorrect Claim Type");

    uint256 _claimId = ++claimIdCounter_;
//    uint256 _claimId = Random.rand(_creationDate);

//    require(claims_[_claimId].claimId == 0, "Claim already exists");
    require(_memberExists(_memberOwner), "Member do not exists");

//    uint256
    _memberOwner = _memberIdFromCurrentAddress();

//    string[] memory messageLog = new string[](0);

    _saveClaim(_claimId, _creationDate, _claimData, _claimType, _memberOwner, false, _creationDate);
    _addClaimIdToMemberOwner(_memberOwner, _claimId);

    if (claimIdCounter_ > 1) {
      checkClaimStatus(_claimId, _claimType, _claimData);
    }

    if (claims_[_claimId].status) {       // if status == true, which means there IS a CONFLICT
      // addClaimFromInbox for every relevant member
      _addClaimFromInbox(_memberOwner, _claimId);
    }

  }
//
  function updateClaim(uint256 _claimId, bytes _claimData, uint _lastChange) public {
//    require(claims_[_claimId].claimId > 0, "Claim not exists");

    _saveClaim(_claimId, claims_[_claimId].creationDate, _claimData, claims_[_claimId].claimType,
              claims_[_claimId].memberOwner, claims_[_claimId].status, _lastChange);
  }

//  EXCLUDE FUNCTION SO THAT SIZE OF CONTRACT (AND BYTECODE) REDUCES; IF NOT ENOUGH, MOVE FUNCTIONS TO DIFFERENT CONTRACT.
//  function changeState(uint256 _claimId, uint _status, string _messageLog, uint256 _lastChange) checkValidStatus(_status) public {
//    require(claims_[_claimId].claimId > 0, "Claim not exists");
//
//    if(claims_[_claimId].status != StatusClaimEnum(_status)) {
//      bool isClaimIntoReceptorInbox = _isClaimIntoReceptorInbox(claims_[_claimId].memberReceptor, _claimId);
//      if(_status == uint(StatusClaimEnum.CONFLICT)) {
//          if(isClaimIntoReceptorInbox) {
//            _removeClaimFromInbox(claims_[_claimId].memberReceptor, _claimId);
//          } else {
//            _removeClaimFromInbox(claims_[_claimId].memberOwner, _claimId);
//          }
//      } else {
//          if(isClaimIntoReceptorInbox) {
//            _addClaimFromInbox(claims_[_claimId].memberOwner, _claimId);
//            _removeClaimFromInbox(claims_[_claimId].memberReceptor, _claimId);
//          } else {
//            _addClaimFromInbox(claims_[_claimId].memberReceptor, _claimId);
//            _removeClaimFromInbox(claims_[_claimId].memberOwner, _claimId);
//          }
//      }
//      claims_[_claimId].status = StatusClaimEnum(_status);
//    }
//    if (keccak256(abi.encodePacked((_messageLog))) != keccak256(abi.encodePacked(("")))) {
//        claims_[_claimId].messageLog.push(_messageLog);
//    }
//
//    claims_[_claimId].lastChange = _lastChange;
//  }

  function getClaim(uint256 _claimId) view public returns (Claim) {
    return claims_[_claimId];
  }

  function getClaimsByMemberId(uint _page) view public returns (Claim[] memory) {
    uint256 pageIndex = SafeMath.mul(PAGE_SIZE, _page);
    uint256 _memberId = _memberIdFromCurrentAddress();
    uint count = _getClaimsCountByMember(_memberId);
    uint256 pageNumber = SafeMath.div(count, PAGE_SIZE);

    if (count == 0 || pageIndex > count - 1 || _page > pageNumber) {
      return;
    }

    uint256[] memory claimsId = _getClaimsIdByMember(_memberId);

    Claim[] memory _claims = new Claim[](PAGE_SIZE);
    uint256 returnCounter = 0;
    for (uint i = pageIndex; i < claimsId.length; ++i) {
      if(returnCounter < PAGE_SIZE) {
        _claims[returnCounter] = claims_[claimsId[i]];
        ++returnCounter;
      } else {
        break;
      }
    }
    return _claims;
  }

  function getClaimsCountByMemberId() view public returns (uint) {
    uint256 _memberId = _memberIdFromCurrentAddress();
    return _getClaimsCountByMember(_memberId);
  }

  // Private
  function _saveClaim(uint256 _claimId, uint256 _creationDate, bytes _claimData, bool _claimType,
    uint _memberOwner, bool _status, uint256 _lastChange) internal {

    RLPReader.RLPItem memory item = _claimData.toRlpItem();
    RLPReader.RLPItem[] memory itemList = item.toList(); // ((name, value), (name, value), (name, value), ...)

    claims_[_claimId].claimId = _claimId;
    claims_[_claimId].creationDate = _creationDate;
    claims_[_claimId].claimType = _claimType;

    delete claims_[_claimId].claimData;
    for(uint i = 0; i < itemList.length; ++i) {
      RLPReader.RLPItem[] memory itemListClaim = itemList[i].toList(); // (name, value)
      claims_[_claimId].claimData.push(NameValue(string(itemListClaim[0].toBytes()), string(itemListClaim[1].toBytes())));
    }

    claims_[_claimId].memberOwner = _memberOwner;
//    claims_[_claimId].memberReceptor = _memberReceptor;
    claims_[_claimId].lastChange = _lastChange;
//    claims_[_claimId].messageLog = _messageLog; // string[] memory
    claims_[_claimId].status = _status;
  }

  // MODIFIERS

  //  modifier checkValidStatus(uint256 _status) {
//    require(_status >= 0 || _status <= 1, "status not allowed");
//    _;
//  }

//  modifier checkMemberOwnership(uint256 _claimId) {
//    require(claims_[_claimId].memberOwner == _memberIdFromCurrentAddress() || claims_[_claimId].memberReceptor == _memberIdFromCurrentAddress(),
//      "not allowed to get this claim");
//    _;
//  }
}
