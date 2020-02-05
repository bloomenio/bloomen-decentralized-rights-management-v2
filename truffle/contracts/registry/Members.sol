pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./SafeMath.sol";
import "./random.sol";
import "./Registry.sol";

contract Members is Random, Registry {

  struct Member { 
    uint256 memberId;
    uint256 creationDate;
    string name;
    string logo;
    string country;
    string cmo;
    string theme;
    uint256[] claimInbox;
    uint256[] claims;
    address[] userRequests;
//    string[] groups;
  }

  uint256 constant private PAGE_SIZE = 10;

  mapping (uint256 => Member) public members_;
  uint256 public memberIdCounter_ = 0; // Equals the number of (members + Super Admins) ever inserted, including the deleted ones.

  uint256[] private membersList_;

  // METHODS
  // Public

  function addMember(uint256 _creationDate, string _name, string _logo, string _country, string _cmo, string _theme) onlySigner public returns(uint) {
    //  string _group) onlySigner public returns(uint) {
    require(_creationDate > 0, "CreationDate is mandatory");
//    uint256 _memberId = Random.rand(_creationDate);
    uint256 _memberId = ++memberIdCounter_;
    require(members_[_memberId].memberId == 0, "Member already exists");
    _saveMember(_memberId, _creationDate, _name, _logo, _country, _cmo, _theme);
//    members_[_memberId].group = _group;
    return _memberId;
  }

  function updateMember(uint256 _memberId, uint256 _creationDate, string _name, string _logo, string _country, string _cmo, string _theme) onlySigner public {
  // , string _group) onlySigner public {
    require(members_[_memberId].memberId > 0, "Member not exists");
    require(members_[_memberId].creationDate == _creationDate, "Creation Date is immutable");
//    _saveMember(_memberId, _creationDate, _name, _logo, _country, _cmo, _theme);
//    members_[_memberId].group = _group;
    members_[_memberId].name = _name;
    members_[_memberId].theme = _theme;
  }

  function getMembers() public view returns (Member[] memory) {
    Member[] memory memberPage = new Member[](membersList_.length);
    for (uint i = 0; i < membersList_.length; ++i) {
        memberPage[i] = members_[membersList_[i]];
    }
    return memberPage;
  }

  function getMembers(uint _page) public view returns (Member[] memory) {
    uint256 pageIndex = SafeMath.mul(PAGE_SIZE, _page);
    uint256 pageNumber = SafeMath.div(membersList_.length, PAGE_SIZE);

    if (membersList_.length == 0 || pageIndex > membersList_.length - 1 || _page > pageNumber) {
      return;
    }

    // Insert items filtered into array.
    uint256 resultCount = 0;
    Member[] memory memberPage = new Member[](PAGE_SIZE);
    for(uint j = pageIndex; j < membersList_.length; ++j) {
        memberPage[resultCount] = members_[membersList_[j]];
        ++resultCount;
    }
    return memberPage;
  }

  function getCount() onlySigner public view returns (uint256) {
    return membersList_.length;
  }

  // Private

  function _saveMember(uint256 _memberId, uint256 _creationDate, string _name, string _logo, string _country, string _cmo, string _theme) internal {

    require(bytes(_name).length != 0, "Name is mandatory");
    require(bytes(_cmo).length != 0, "CMO is mandatory");
    require(bytes(_theme).length != 0, "Theme is mandatory");

    Member memory member = members_[_memberId];
    member.memberId = _memberId;
    member.creationDate = _creationDate;
    member.name = _name;
    member.logo = _logo;
    member.country = _country;
    member.cmo = _cmo;
    member.theme = _theme;

    members_[_memberId] = member;
    membersList_.push(_memberId);

  }

  function _getClaimsIdByMember(uint _memberId) public view returns(uint[])  {
    require(members_[_memberId].memberId > 0, "member not exists");
    return members_[_memberId].claims;
  }

  function _getClaimsCountByMember(uint _memberId) public view returns(uint) {
    return members_[_memberId].claims.length;
  }

  function _addUserToMemberRequest(uint _memberId) internal {
    members_[_memberId].userRequests.push(msg.sender);
  }

  function _addClaimIdToMemberOwner(uint _memberId, uint _claimId) public {
    members_[_memberId].claims.push(_claimId);
  }

  function _removeClaimIdFromMember(uint _memberId, uint _claimId) public {
//    _rP(_memberId, _claimId);
//  }
//
//  function _rP(uint _memberId, uint _claimId) private {
    uint claimCount = members_[_memberId].claims.length;
    if (claimCount > 0) { // require(claimCount > 0, "not enough claims in member");
      members_[_memberId].claims[_claimId] = members_[_memberId].claims[claimCount-1];
      members_[_memberId].claims[claimCount-1] = _claimId;
      members_[_memberId].claims.length--;
    }
  }

  function _addClaimFromInbox(uint _memberId, uint _claimId) public {
    members_[_memberId].claimInbox.push(_claimId);
  }

  function _memberExists(uint _memberId) public view returns(bool) {
    return members_[_memberId].memberId > 0;
  }

  function _removeClaimFromInbox(uint _memberId, uint _claimId) public {
    bool found = false;
    // Remove index
    for (uint j = 0; j < members_[_memberId].claimInbox.length - 1; j++) {
      if(members_[_memberId].claimInbox[j] == _claimId) {
        found = true;
      }
      if(found) {
        members_[_memberId].claimInbox[j] = members_[_memberId].claimInbox[j + 1];
      }
    }
    if (found) {
      delete members_[_memberId].claimInbox[members_[_memberId].claimInbox.length - 1];
      members_[_memberId].claimInbox.length--;
    }
  }

  function _clearUserFromMemberRequest(uint _memberId, address userAddress) internal {
     bool found = false;
    // Remove index
    for (uint j = 0; j < members_[_memberId].userRequests.length - 1; j++) {
      if(members_[_memberId].userRequests[j] == userAddress) {
        found = true;
      }
      if(found) {
        members_[_memberId].userRequests[j] = members_[_memberId].userRequests[j + 1];
      }
    }
//    if (found) {
      delete members_[_memberId].userRequests[members_[_memberId].userRequests.length - 1];
      members_[_memberId].userRequests.length--;
//    }
  }

}