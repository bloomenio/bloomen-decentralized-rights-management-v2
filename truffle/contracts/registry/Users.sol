pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./Members.sol";
import "./Claims.sol";
import "./SignerRole.sol";
import "./random.sol";


contract Users is Random, SignerRole {

  Members private _Members;
  //  Users.User private currentUser;

  constructor (address _MembersAddr) public {
    _Members = Members(_MembersAddr);
    //    currentUser = _Users.getUserByAddress(msg.sender);
  }

  struct User {
    uint256 creationDate;
    string firstName;
    string lastName;
    uint256 memberId;
    uint256 requestId;
    string role;
    StatusUserEnum status;
    address owner;  // primary key
    string cmo;
    string[] groups;
    uint tokens;
    string kycData;
  }

  enum StatusUserEnum {
    REJECTED, // 0
    PENDING,  // 1
    ACCEPTED  // 2
  }

  mapping (address => User) private users_;
  address[] private usersList_;
  uint256 constant private PAGE_SIZE = 10;

  uint256 constant private userStartTokens = 100;

  // PUBLIC

  function registerUserRequest(uint256 _creationDate, string _firstName, string _lastName, string _role,
    uint256 _memberId, string _kycData) public {

    require(_memberId != 0, "No valid memberId");
    require(_creationDate > 0, "CreationDate is mandatory");
    require(users_[msg.sender].creationDate == 0, "User already exists");
    require(_memberExists(_memberId), "Member not exists");

    uint256 _requestId = Random.rand(_creationDate);
    _saveUser(_creationDate, _firstName, _lastName, _memberId, _requestId, _role, uint256(StatusUserEnum.PENDING),
      msg.sender, 0);
    users_[msg.sender].kycData = _kycData;
  }

  function updateUser(string _firstName, string _lastName, uint256 _memberId, string _role, address owner,
    uint _tokens, string _kycData) public {

    require(users_[owner].owner > address(0), "This user not exists");
    require(uint(users_[owner].status) == uint(StatusUserEnum.ACCEPTED), "You are not accepted");
    if (users_[owner].tokens > _tokens) {
      _Members.getMembersMapping(); //[users_[owner].memberId].totalTokens += users_[owner].tokens - _tokens;
    } else {
      _Members.members_[users_[owner].memberId].totalTokens -= _tokens - users_[owner].tokens;
    }
    users_[owner].tokens = _tokens;
    users_[owner].kycData = _kycData;

    uint256 _requestId = users_[owner].requestId;
    uint256 _creationDate = users_[owner].creationDate;
    uint256 _status = uint(users_[owner].status);

    _saveUser(_creationDate, _firstName, _lastName, _memberId, _requestId, _role, _status, owner, 1);
  }

  function getUsedTokens(uint256 _memberId) public view returns (uint){
    uint usedTokens = 0;
    for (uint i = 0; i < usersList_.length; ++i) {
      if (users_[usersList_[i]].memberId == _memberId) {
        usedTokens += users_[usersList_[i]].tokens;
      }
    }
    return usedTokens;
  }

  function updateSuperUser(string _firstName, string _lastName, uint256 _memberId, string _role,
    address owner, string[] _groups) public {

    users_[owner].firstName = _firstName;
    users_[owner].lastName = _lastName;
    users_[owner].groups = _groups;

    for (uint i = 0; i < usersList_.length; ++i) {
      if (keccak256(users_[usersList_[i]].cmo) == keccak256(users_[owner].cmo)) {
        users_[usersList_[i]].groups = _groups;
      }
    }

  }

  function rejectUser(address _userToReject) public {

    require(users_[_userToReject].owner > address(0), "This user not exists");
    require((users_[msg.sender].memberId == users_[_userToReject].memberId) || isSigner(msg.sender), "You cannot accept this user");
    require((uint(users_[msg.sender].status) == uint(StatusUserEnum.ACCEPTED)) || isSigner(msg.sender), "You are not accepted");
    require(users_[_userToReject].status == StatusUserEnum.PENDING, "Only pending users can be rejected");

    users_[_userToReject].status = StatusUserEnum.REJECTED;
    _Members._clearUserFromMemberRequest(users_[_userToReject].memberId, _userToReject);
  }

  function acceptUser(address _userToAccept) public {

    require(users_[_userToAccept].owner > address(0), "This user not exists");
    require((users_[msg.sender].memberId == users_[_userToAccept].memberId) || isSigner(msg.sender), "You cannot accept this user");
    require((uint(users_[msg.sender].status) == uint(StatusUserEnum.ACCEPTED)) || isSigner(msg.sender), "You are not accepted");
    require(users_[_userToAccept].status == StatusUserEnum.PENDING, "Only pending users can be accepted");

    if (_Members.members_[users_[_userToAccept].memberId].totalTokens > userStartTokens) {
      users_[_userToAccept].status = StatusUserEnum.ACCEPTED;
      _Members._clearUserFromMemberRequest(users_[_userToAccept].memberId, _userToAccept);
      users_[_userToAccept].tokens = userStartTokens;
      _Members.members_[users_[_userToAccept].memberId].totalTokens -= userStartTokens;
    } else {
      rejectUser(_userToAccept);
    }
  }

  function getcountUsers() public view returns(uint) {
    uint256 counter = 0;
    for (uint i = 0; i < usersList_.length; ++i) {
      if(users_[usersList_[i]].memberId == users_[msg.sender].memberId
        && users_[usersList_[i]].status == StatusUserEnum.ACCEPTED) {
        counter++;
      }
    }
    return counter;
  }

  function whitelistAdmin(address account, string _cmo) public onlySigner {
    _Members._clearUserFromMemberRequest(users_[account].memberId, account);
    users_[account].role = "Super admin";
    users_[account].memberId = ++_Members.memberIdCounter_;
    users_[account].cmo = _cmo;
//    users_[account].tokens = 0; // should "Super admin" have tokens?
    users_[account].status = StatusUserEnum.ACCEPTED;
    users_[account].groups = ["digit1"];
    addSigner(account);
  }

  function getUsers(uint256 _page) public view returns(User[] memory) {
    uint256 counter = getcountUsers();

    uint256 pageIndex = SafeMath.mul(PAGE_SIZE, _page);
    uint256 pageNumber = SafeMath.div(usersList_.length, PAGE_SIZE);

    if (counter == 0 || pageIndex > counter || _page > pageNumber) {
      return;
    }
    User[] memory userPageBasic = new User[](PAGE_SIZE);
    uint256 counterFinal = 0;

    for (uint j = pageIndex; j < usersList_.length; ++j) {
      if(users_[usersList_[j]].memberId == users_[msg.sender].memberId
        && users_[usersList_[j]].status == StatusUserEnum.ACCEPTED) {
        userPageBasic[counterFinal] = users_[usersList_[j]];
        ++counterFinal;
      }
    }
    return userPageBasic;
  }

  function getUserByAddress(address userAddress) public view returns(User memory) {
    return users_[userAddress];
  }

  function getUsersOwner() onlySigner public view returns(User[] memory) {
    User[] memory userPageOwner = new User[](usersList_.length);

    for (uint i = 0; i < usersList_.length; ++i) {
      userPageOwner[i] = users_[usersList_[i]];
    }

    return userPageOwner;
  }

  function getMe() public view returns(User) {
    User memory user = users_[msg.sender];
    return user;
  }


  function _saveUser(uint256 _creationDate, string _firstName, string _lastName, uint256 _memberId,
    uint256 _requestId, string _role, uint256 _status, address owner, uint isCreate) private {

    require(_status >= 0 || _status <=2, "status is not valid");
    require(bytes(_role).length != 0, "role is mandatory");

    User memory user = users_[owner];

    user.creationDate =  _creationDate;
    user.firstName =  _firstName;
    user.lastName =  _lastName;
    user.memberId =  _memberId;
    user.requestId =  _requestId;
    user.role = _role;
    user.status = StatusUserEnum(_status);
    user.owner = owner;

    users_[owner] = user;

    if(isCreate == 0) {
      usersList_.push(owner);
//      if (users_[owner].status != StatusUserEnum.ACCEPTED) {
      _Members._addUserToMemberRequest(_memberId);
//      }
      users_[owner].groups = ["digit1"];                  // by default
      users_[owner].cmo = _Members.members_[user.memberId].cmo;  // to initialize
    }
  }

  function _memberIdFromCurrentAddress(address addr) view public returns(uint256) {
    return users_[addr].memberId;
  }

  function updateTokens(address addr, uint transactionPrice) public {
    users_[addr].tokens -= transactionPrice;
    _Members.members_[users_[addr].memberId].totalTokens -= transactionPrice;
  }

  function getUserTokensByAddress(address addr) view public returns(uint) {
    return users_[addr].tokens;
  }

  // Moved from Members.sol
  function _memberExists(uint _memberId) public view returns(bool) {
    return _Members.members_[_memberId].memberId > 0;
  }

  function _addClaimIdToMemberOwner(uint _memberId, uint _claimId) public {
    _Members.members_[_memberId].claims.push(_claimId);
  }

  function _removeClaimFromMember(uint _memberId, uint _claimId) public {
    bool found = false;
    for (uint j = 0; j < _Members.members_[_memberId].claims.length - 1; j++) {
      if(_Members.members_[_memberId].claims[j] == _claimId) {
        found = true;
      }
      if(found) {
        _Members.members_[_memberId].claims[j] = _Members.members_[_memberId].claims[j + 1];
      }
    }
    //    if (found) {
    //    delete members_[_memberId].claims[members_[_memberId].claims.length - 1];
    //    members_[_memberId].claims.length--;
    //    }
    if (found) {
      //      if (members_[_memberId].claims.length == 1) {
      //        delete members_[_memberId].claims;
      //      }
      //      else {
      delete _Members.members_[_memberId].claims[_Members.members_[_memberId].claims.length - 1];
      _Members.members_[_memberId].claims.length--;
      //      }
    }
  }

  function _removeClaimFromInbox(uint _memberId, uint _claimId) public {
    bool found = false;
    // Remove index
    for (uint j = 0; j < _Members.members_[_memberId].claimInbox.length - 1; j++) {
      if(_Members.members_[_memberId].claimInbox[j] == _claimId) {
        found = true;
      }
      if(found) {
        _Members.members_[_memberId].claimInbox[j] = _Members.members_[_memberId].claimInbox[j + 1];
      }
    }
    if (found) {
      delete _Members.members_[_memberId].claimInbox[_Members.members_[_memberId].claimInbox.length - 1];
      _Members.members_[_memberId].claimInbox.length--;
    }
  }

  function _getClaimsCountByMember(uint _memberId) public view returns(uint) {
    return _Members.members_[_memberId].claims.length;
  }

  function _getClaimsIdByMember(uint _memberId) public view returns(uint[])  {
    require(_Members.members_[_memberId].memberId > 0, "member not exists");
    return _Members.members_[_memberId].claims;
  }

  function _getMemberIdsOfCurrentCMO(string currentCMO, uint256 currentCMOId) public returns(uint[]) {
    uint[] memberIds;
    for (uint j = 0; j < _Members.membersList_.length; ++j) {
      if (keccak256(_Members.members_[_Members.membersList_[j]].cmo) == keccak256(currentCMO) &&
      _Members.members_[_Members.membersList_[j]].memberId != currentCMOId) {
        memberIds.push(_Members.members_[_Members.membersList_[j]].memberId);
      }
    }
    return memberIds;
  }

  function _addClaimFromInbox(uint _memberId, uint _claimId) public {
    _Members.members_[_memberId].claimInbox.push(_claimId);
  }

}

