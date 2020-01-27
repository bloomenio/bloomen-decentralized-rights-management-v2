pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./SafeMath.sol";
import "../../node_modules/solidity-rlp/contracts/RLPReader.sol";
import "./Users.sol";
import "../../node_modules/solidity-stringutils/strings.sol";



contract Claims {

  Users private _Users;

  constructor (address _UsersAddr) public {
    _Users = Users(_UsersAddr);
  }

  using RLPReader for bytes;
  using RLPReader for uint;
  using RLPReader for RLPReader.RLPItem;

  struct NameValue{
    string name;
    string value;
  }

  struct Claim {
    uint256 creationDate;
    uint256 claimId;        // should be 2^48 ~ 100 trillion claims
    NameValue[] claimData;
    bool claimType;
    uint256 memberOwner;    // should be 2^24 ~ 16 million members
    bool status;
    uint256 lastChange;
  }

  mapping (uint256 => Claim) private claims_;
  mapping (uint256 => uint16) private maxSplits_;
  uint256 constant private PAGE_SIZE = 10;

  uint256 private claimIdCounter_ = 0; // has the number of claims ever inserted, including the deleted ones
  //   uint256[] private claimIdIndex;
  bool private hasOverlapResult;
  using strings for *;

  function computeClaim(uint256 _creationDate, bytes _claimData, bool _claimType, uint256 _memberOwner, bool register_or_update,
    uint256 _claimId, bytes _oldClaimData, uint _lastChange, bool _updateClaimId) public {

    if (register_or_update) {             // Register new claim.
      _claimId = ++claimIdCounter_;
      //    require(claims_[_claimId].claimId == 0, "Claim already exists");
      require(_Users._memberExists(_memberOwner), "Member do not exists");
//      _memberOwner = _Users._memberIdFromCurrentAddress(msg.sender);

      _saveClaim(_claimId, _creationDate, _claimData, _claimType, _memberOwner, false, _creationDate);
      _Users._addClaimIdToMemberOwner(_memberOwner, _claimId);

      checkClaimStatus(_claimId, _claimType, _claimData, true);
    } else {                     // Update existing claim.

      checkClaimStatus(_claimId, _claimType, _oldClaimData, false);
//      if (_updateClaimId) {
//        checkClaimStatus(updateClaimId(_claimId, _claimData, _memberOwner, _claimType), _claimType, _claimData, true);
//        _saveClaim(updateClaimId(_claimId, _claimData, _memberOwner, _claimType), _creationDate, _claimData, _claimType,
//          _memberOwner, claims_[_claimId].status, _lastChange);
//      } else {
        checkClaimStatus(_claimId, _claimType, _claimData, true);
        _saveClaim(_claimId, _creationDate, _claimData, _claimType, _memberOwner, claims_[_claimId].status, _lastChange);
//      }

      if (_creationDate == 0) {  // Delete claim.
//        _removeClaimIdFromMember(_memberOwner, _claimId);
//        _removeClaim(_claimId);
      }
    }
  }

  function getClaim(uint256 _claimId) view public returns (Claim) {
    return claims_[_claimId];
  }


  function getClaimsByMemberId(uint _page) view public returns (Claim[] memory) {

    uint256 pageIndex = SafeMath.mul(PAGE_SIZE, _page);
    uint256 _memberId = _Users._memberIdFromCurrentAddress(msg.sender);
    uint count = _Users._getClaimsCountByMember(_memberId);
    uint256 pageNumber = SafeMath.div(count, PAGE_SIZE);

    if (count == 0 || pageIndex > count - 1 || _page > pageNumber) {
      return;
    }

    uint256[] memory claimsId = _Users._getClaimsIdByMember(_memberId);

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
    uint256 _memberId = _Users._memberIdFromCurrentAddress(msg.sender);
    return _Users._getClaimsCountByMember(_memberId);
  }

  function _saveClaim(uint256 _claimId, uint256 _creationDate, bytes _claimData, bool _claimType,
    uint _memberOwner, bool _status, uint256 _lastChange) private {

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
    claims_[_claimId].lastChange = _lastChange;
    claims_[_claimId].status = _status;
  }

  // Old Lib.sol
//
//  using RLPReader for bytes;
//  using RLPReader for uint;
//  using RLPReader for RLPReader.RLPItem;
//
//  struct NameValue{
//    string name;
//    string value;
//  }
//
//  struct Claim {
//    uint256 creationDate;
//    uint256 claimId;        // should be 2^48 ~ 100 trillion claims
//    NameValue[] claimData;
//    bool claimType;
//    uint256 memberOwner;    // should be 2^24 ~ 16 million members
//    bool status;
//    uint256 lastChange;
//    //    string[] log;
//    //    uint16 log2;
//  }
//
//  mapping (uint256 => Claim) internal claims_;
//  mapping (uint256 => uint16) internal maxSplits_;
//  uint256 constant internal PAGE_SIZE = 10;
//
//  uint256 internal claimIdCounter_ = 0; // has the number of claims ever inserted, including the deleted ones
//  //  uint256[] private claimIdIndex;

  function checkClaimStatus(uint256 _claimId, bool _claimType, bytes _claimData, bool newClaim) private {

    //    if (newClaim) {
    //      claimIdIndex.push(_claimId);
    //    }
    RLPReader.RLPItem memory item = _claimData.toRlpItem();
    RLPReader.RLPItem[] memory itemList = item.toList();  // ((name0, value0), (name, value), (name, value), ...)
    uint16 split = uint16(bytesToUint(itemList[5].toList()[1].toBytes()));
    uint48 startDate = uint48(bytesToUint(itemList[2].toList()[1].toBytes()));
    uint48 endDate = uint48(bytesToUint(itemList[3].toList()[1].toBytes()));

    maxSplits_[_claimId]=split;
//    claims_[_claimId].maxSplit.push(maxSplits_[_claimId]);
    bool prevStatus = claims_[_claimId].status;
    bool tempMaxSplitOnce = true;

    if (split == 0) {
      if (prevStatus) {
        claims_[_claimId].status = false;
        _Users._removeClaimFromInbox(claims_[_claimId].memberOwner, _claimId);
        prevStatus = false;
      }
    }
    else {
      for(uint256 i = 1; i <= claimIdCounter_; i++) {
        if (_claimType == claims_[i].claimType && _claimId != i) {
          if(keccak256(itemList[0].toList()[1].toBytes()) == keccak256(claims_[i].claimData[0].value) // same ISRC/ISWC
          && endDate >= uint48(bytesToUint(bytes(claims_[i].claimData[2].value))) // end1 >= start2
          && startDate <= uint48(bytesToUint(bytes(claims_[i].claimData[3].value))) // start1 <= end2
          ){
            if (newClaim) {
              // claims_[2].log.push('CHECK STATUS TRUE');
            } else {
              // claims_[2].log.push('CHECK STATUS FALSE');
            }
            // claims_[2].log.push(string(itemList[4].toList()[1].toBytes()));
            // claims_[2].log.push(string(bytes(claims_[i].claimData[4].value)));
            hasOverlap(itemList[4].toList()[1].toBytes(), bytes(claims_[i].claimData[4].value)); // useTypes/rightTypes: have at least one common
            if (hasOverlapResult) {
              hasOverlap(itemList[1].toList()[1].toBytes(), bytes(claims_[i].claimData[1].value)); // territory: contain at least one common
              if (hasOverlapResult) {
                if (newClaim) {
                  maxSplits_[i]+=split;                // build maxSplits_[i]
  //                claims_[i].maxSplit.push(maxSplits_[i]);
                  if (maxSplits_[i]>100) {
                    if (!prevStatus) {
                      claims_[_claimId].status = true; // true, means there IS a CONFLICT
                      _Users._addClaimFromInbox(claims_[_claimId].memberOwner, _claimId);
                      prevStatus = true;
                    }
                    if (!claims_[i].status) {
                      _Users._addClaimFromInbox(claims_[i].memberOwner, claims_[i].claimId);
                      claims_[i].status = true;
                    }
                  }
                  if (tempMaxSplitOnce) {
                    maxSplits_[_claimId]=maxSplits_[i];
                    //                claims_[_claimId].maxSplit.push(maxSplits_[_claimId]);
                    tempMaxSplitOnce=false;
                  }
                } else {
                  maxSplits_[i]-=split;
  //                claims_[i].maxSplit.push(maxSplits_[i]);
                  if (prevStatus) {
                    claims_[_claimId].status = false;
                    _Users._removeClaimFromInbox(claims_[_claimId].memberOwner, _claimId);
                    prevStatus = false;
                  }
                  if (maxSplits_[i]<=100) {
                    if (claims_[i].status) {
                      _Users._removeClaimFromInbox(claims_[i].memberOwner, claims_[i].claimId);
                      claims_[i].status = false;
                    }
                  }
                  if (tempMaxSplitOnce) {
                    maxSplits_[_claimId]=split;
                    tempMaxSplitOnce=false;
                  }
                }
              }  // hasOverlapResult territory
            } // hasOverlapResult: useTypes/rightTypes
          } // if ....
        } // if claimId<>i
      } // for
    } // if (split == 0)
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

  function hasOverlap(bytes _b1, bytes _b2) private {

    hasOverlapResult = false;
    var delim = ",".toSlice();
    var s1 = string(_b1).toSlice();
    var parts1 = new string[](s1.count(delim) + 1);
    for(uint i = 0; i < parts1.length; i++) {
      parts1[i] = s1.split(delim).toString();
    }
    var s2 = string(_b2).toSlice();
    var parts2 = new string[](s2.count(delim) + 1);
    for(uint j = 0; j < parts2.length; j++) {
      parts2[j] = s2.split(delim).toString();
    }

    for(i = 0; i < parts1.length; i++) {
      for(j = 0; j < parts2.length; j++) {
        if (keccak256(parts1[i]) == keccak256(parts2[j])) {
          hasOverlapResult = true;
          break;
        }
      }
      if (hasOverlapResult) {
        break;
      }
    }

  }

  function updateClaimId(uint _claimId, bytes _claimData, uint _memberOwner, bool _claimType) private returns (uint) {
    RLPReader.RLPItem memory item = _claimData.toRlpItem();
    RLPReader.RLPItem[] memory itemList = item.toList();

    for(uint256 i = 1; i <= claimIdCounter_; i++) {
      if (_claimType == claims_[i].claimType && _claimId != i) {
        if(keccak256(abi.encodePacked(itemList[0].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[0].value)) // same ISRC/ISWC
        && keccak256(abi.encodePacked(itemList[1].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[1].value)) // same countries
        && keccak256(abi.encodePacked(itemList[2].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[2].value)) // same startDate
        && keccak256(abi.encodePacked(itemList[3].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[3].value)) // same endDate
        && keccak256(abi.encodePacked(itemList[4].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[4].value)) // same use/right-Types
        && keccak256(abi.encodePacked(itemList[5].toList()[1].toBytes())) == keccak256(abi.encodePacked(claims_[i].claimData[5].value)) // same split
        && _memberOwner == claims_[i].memberOwner                                                                                       // same memberOwner
        ){
          return i;
        }
      }
    }
    return ++claimIdCounter_;
  }
}