pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../../node_modules/solidity-rlp/contracts/RLPReader.sol";
import "./Users.sol";
import "./Lib.sol";

contract Claims is Users, Lib {

  using RLPReader for bytes;
  using RLPReader for uint;
  using RLPReader for RLPReader.RLPItem;

  uint256 constant private PAGE_SIZE = 10;

  function registerClaim(uint256 _creationDate, bytes _claimData, bool _claimType, uint _memberOwner) public {

    require(_creationDate > 0, "CreationDate is mandatory");
    //    require(_claimType || !_claimType, "Incorrect Claim Type");

    uint256 _claimId = ++claimIdCounter_;
    //    uint256 _claimId = Random.rand(_creationDate);

    //    require(claims_[_claimId].claimId == 0, "Claim already exists");
    require(_memberExists(_memberOwner), "Member do not exists");

    //    uint256
    _memberOwner = _memberIdFromCurrentAddress();

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

    if (claimIdCounter_ > 1) {
      checkClaimStatus(_claimId, claims_[_claimId].claimType, _claimData);
    }
    _saveClaim(_claimId, claims_[_claimId].creationDate, _claimData, claims_[_claimId].claimType,
      claims_[_claimId].memberOwner, claims_[_claimId].status, _lastChange);
  }

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

}
