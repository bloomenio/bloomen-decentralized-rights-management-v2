pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../../node_modules/solidity-rlp/contracts/RLPReader.sol";
import "./Users.sol";
import "./Lib.sol";

contract Claims is Users, Lib {

  using RLPReader for bytes;
  using RLPReader for uint;
  using RLPReader for RLPReader.RLPItem;

  function computeClaim(uint256 _creationDate, bytes _claimData, bool _claimType, uint _memberOwner, bool reg_update,
    uint256 _claimId, bytes _oldClaimData, uint _lastChange) public {

    if (reg_update) {             // Register new claim.
      _claimId = ++claimIdCounter_;
      //    uint256 _claimId = Random.rand(_creationDate);
      //    require(claims_[_claimId].claimId == 0, "Claim already exists");
      require(_memberExists(_memberOwner), "Member do not exists");

      _memberOwner = _memberIdFromCurrentAddress();

      _saveClaim(_claimId, _creationDate, _claimData, _claimType, _memberOwner, false, _creationDate);
      _addClaimIdToMemberOwner(_memberOwner, _claimId);

      checkClaimStatus(_claimId, _claimType, _claimData, true);
    } else {                     // Update existing claim.

      checkClaimStatus(_claimId, claims_[_claimId].claimType, _oldClaimData, false);
      checkClaimStatus(_claimId, claims_[_claimId].claimType, _claimData, true);

      _saveClaim(_claimId, _creationDate, _claimData, claims_[_claimId].claimType,
        claims_[_claimId].memberOwner, claims_[_claimId].status, _lastChange);
      if (_creationDate == 0) {  // Delete claim.
        _removeClaimIdFromMember(_memberOwner, _claimId);
      }
    }
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
//
//  function getClaim(uint256 _claimId) view public returns (Claim) {
//    return claims_[_claimId];
//  }

  function getClaimsCountByMemberId() view public returns (uint) {
    uint256 _memberId = _memberIdFromCurrentAddress();
    return _getClaimsCountByMember(_memberId);
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
}