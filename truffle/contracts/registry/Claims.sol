pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../../node_modules/solidity-rlp/contracts/RLPReader.sol";
import "./Users.sol";

contract Claims is Users {

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
    uint256 memberOwner;
    uint256 memberReceptor;
    string[] messageLog;
    StatusClaimEnum status;
    uint256 lastChange;   
  }

  uint256 constant private PAGE_SIZE = 10;

  mapping (uint256 => Claim) private claims_;

  // METHODS

  // Public
  function registerClaim(uint256 _creationDate, bytes _claimData, uint256 _claimType, uint _memberReceptor) public {

      require(_creationDate > 0, "CreationDate is mandatory");
      require(_claimType >= 0 || _claimType <= 1, "Incorrect Claim Type");

      uint256 _claimId = Random.rand(_creationDate);

      require(claims_[_claimId].claimId == 0, "Claim already exists");
      require(_memberExists(_memberReceptor), "Member do not exists");

      uint256 _memberOwner = _memberIdFromCurrentAddress();

      string[] memory messageLog = new string[](0);

      _saveClaim(_claimId, _creationDate, _claimData, _claimType, _memberOwner, _memberReceptor, messageLog, uint(StatusClaimEnum.CONFLICT), _creationDate);
      _addClaimIdToMemberOwner(_memberOwner, _claimId);
      _addClaimFromInbox(_memberReceptor, _claimId);
  }

  function updateClaim(uint256 _claimId, bytes _claimData, uint _lastChange) checkMemberOwnership(_claimId) public {
    require(claims_[_claimId].claimId > 0, "Claim not exists");

    _saveClaim(_claimId, claims_[_claimId].creationDate, _claimData, uint(claims_[_claimId].claimType), 
      claims_[_claimId].memberOwner, claims_[_claimId].memberReceptor, claims_[_claimId].messageLog, uint(claims_[_claimId].status), _lastChange);
  }

  function changeState(uint256 _claimId, uint _status, string _messageLog, uint256 _lastChange) checkValidStatus(_status) public {
    require(claims_[_claimId].claimId > 0, "Claim not exists");

     if(claims_[_claimId].status != StatusClaimEnum(_status)) {

        if(_status == uint(StatusClaimEnum.CLAIMED)) {
            _removeClaimFromInbox(claims_[_claimId].memberOwner, _claimId);
          }
        else {
            _addClaimFromInbox(claims_[_claimId].memberOwner, _claimId);
        }
        claims_[_claimId].status = StatusClaimEnum(_status);
     }
      if (keccak256(abi.encodePacked((_messageLog))) != keccak256(abi.encodePacked(("")))) {
          claims_[_claimId].messageLog.push(_messageLog);
      }

      claims_[_claimId].lastChange = _lastChange;
  }

  function getClaim(uint256 _claimId) checkMemberOwnership(_claimId) view public returns (Claim) {
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
  function _saveClaim(uint256 _claimId, uint256 _creationDate, bytes _claimData, uint256 _claimType, 
    uint _memberOwner, uint _memberReceptor, string[] memory _messageLog, uint256 _status, uint256 _lastChange) internal {

      RLPReader.RLPItem memory item = _claimData.toRlpItem();
      RLPReader.RLPItem[] memory itemList = item.toList();

      claims_[_claimId].claimId = _claimId;
      claims_[_claimId].creationDate = _creationDate;
      claims_[_claimId].claimType = ClaimTypeEnum(_claimType);

      delete claims_[_claimId].claimData;
      for(uint i = 0; i < itemList.length; ++i) {
        RLPReader.RLPItem[] memory itemListClaim = itemList[i].toList();
        claims_[_claimId].claimData.push(NameValue(string(itemListClaim[0].toBytes()), string(itemListClaim[1].toBytes())));
      }

      claims_[_claimId].memberOwner = _memberOwner;
      claims_[_claimId].memberReceptor = _memberReceptor;
      claims_[_claimId].lastChange = _lastChange;

      

      claims_[_claimId].messageLog = _messageLog;

      claims_[_claimId].status = StatusClaimEnum(_status);
      
  }

  // MODIFIERS

  modifier checkValidStatus(uint256 _status) {
    require(_status >= 0 || _status <= 1, "status not allowed");
    _;
  }

  modifier checkMemberOwnership(uint256 _claimId) {
    require(claims_[_claimId].memberOwner == _memberIdFromCurrentAddress() || claims_[_claimId].memberReceptor == _memberIdFromCurrentAddress(), 
      "not allowed to get this claim");
    _;
  }
}
