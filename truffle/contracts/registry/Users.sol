pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./Members.sol";
import "./Claims.sol";

contract Users {

  Members private _Members;
  //  Users.User private currentUser;

  constructor (address _MembersAddr) public {
    _Members = Members(_MembersAddr);
    //    currentUser = _Users.getUserByAddress(msg.sender);
  }

  modifier onlySigner() {
    require(_Members.isSigner(msg.sender));
    _;
  }

  struct User {
//    uint256 creationDate;
//    uint256 accountExpirationDate;
    address owner;  // primary key
    uint256 memberId;
    uint256 requestId;
    uint tokens;
    string firstName;
    string lastName;
    string role;
    string cmo;
    string[] groups;
    string kycData;
    uint status;
  }
//
//  enum StatusUserEnum {
//    REJECTED, // 0
//    PENDING,  // 1
//    ACCEPTED  // 2
//  }

  mapping (address => User) private users_;
  address[] private usersList_;
  uint256 constant private PAGE_SIZE = 10;
  uint private requestIdCounter = 1592831436680;
  uint256 constant private userStartTokens = 100;

  // PUBLIC

  function registerUserRequest(string _firstName, string _lastName, string _role, uint256 _memberId,
    string _kycData) public {

    require(_memberId != 0, "No valid memberId");
//    require(_creationDate > 0, "CreationDate is mandatory");
//    require(users_[msg.sender].creationDate == 0, "User already exists");
    require(_Members._memberExists(_memberId), "Member not exists");

    uint256 _requestId = _Members.calcRandom(++requestIdCounter);
    _saveUser(_firstName, _lastName, _memberId, _requestId, _role, 1, msg.sender, 0);
    users_[msg.sender].kycData = _kycData;
  }

  function updateUser(string _firstName, string _lastName, uint256 _memberId, string _role, address owner,
    uint _tokens, string _kycData) public {

    require(users_[owner].owner > address(0), "This user not exists");
    require(users_[owner].status == 2, "You are not accepted");
    if (users_[owner].tokens > _tokens) {
      _Members.increaseMemberTotalTokens(users_[owner].memberId, users_[owner].tokens - _tokens);
//      members_[users_[owner].memberId].totalTokens += users_[owner].tokens - _tokens; // add new Members function
    } else {
      _Members.updateMemberTotalTokens(users_[owner].memberId, _tokens - users_[owner].tokens);
//      members_[users_[owner].memberId].totalTokens -= _tokens - users_[owner].tokens; // -//-
    }
    users_[owner].tokens = _tokens;
    users_[owner].kycData = _kycData;

    uint256 _requestId = users_[owner].requestId;
//    uint256 _creationDate = users_[owner].creationDate;
    uint256 _status = users_[owner].status;

    _saveUser(_firstName, _lastName, _memberId, _requestId, _role, _status, owner, 1);
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

  function updateSuperUser(string _firstName, string _lastName, uint256 _memberId, string _role, address owner,
    string[] _groups) public {

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
    require((users_[msg.sender].memberId == users_[_userToReject].memberId) || _Members.isSigner(msg.sender), "You cannot accept this user");
    require(users_[msg.sender].status == 2 || _Members.isSigner(msg.sender), "You are not accepted");
    require(users_[_userToReject].status == 1, "Only pending users can be rejected");

    users_[_userToReject].status = 0;
    _Members._clearUserFromMemberRequest(users_[_userToReject].memberId, _userToReject);
  }

  function acceptUser(address _userToAccept) public {

    require(users_[_userToAccept].owner > address(0), "This user not exists");
    require((users_[msg.sender].memberId == users_[_userToAccept].memberId) || _Members.isSigner(msg.sender), "You cannot accept this user");
    require(users_[msg.sender].status == 2 || _Members.isSigner(msg.sender), "You are not accepted");
    require(users_[_userToAccept].status == 1, "Only pending users can be accepted");

    // new functions
    if (_Members.getMemberTotalTokens(users_[_userToAccept].memberId) > userStartTokens) {
      users_[_userToAccept].status = 2;
      _Members._clearUserFromMemberRequest(users_[_userToAccept].memberId, _userToAccept);
      users_[_userToAccept].tokens = userStartTokens;
      _Members.updateMemberTotalTokens(users_[_userToAccept].memberId, userStartTokens);
//      members_[users_[_userToAccept].memberId].totalTokens -= userStartTokens;
    } else {
      rejectUser(_userToAccept);
    }
  }

  function getcountUsers() public view returns(uint) {
    uint256 counter = 0;
    for (uint i = 0; i < usersList_.length; ++i) {
      if(users_[usersList_[i]].memberId == users_[msg.sender].memberId
        && users_[usersList_[i]].status == 2) {
        counter++;
      }
    }
    return counter;
  }

  function whitelistAdmin(address account, string _cmo) public onlySigner {
    _Members._clearUserFromMemberRequest(users_[account].memberId, account);
    users_[account].role = "Super admin";
    users_[account].memberId = _Members.returnUpdatedMemberIdCounter();
    users_[account].cmo = _cmo;
//    users_[account].tokens = 0; // should "Super admin" users have tokens?
    users_[account].status = 2;
    users_[account].groups = ["digit1"];
    _Members.addSigner(account);
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
        && users_[usersList_[j]].status == 2) {
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
      if (bytes(users_[msg.sender].firstName).length != 0) {
        User memory user = users_[msg.sender];
        return user;
      } else {
        return;
      }
  }


  function _saveUser(string _firstName, string _lastName, uint256 _memberId,
    uint256 _requestId, string _role, uint256 _status, address owner, uint isCreate) internal {

    require(_status >= 0 && _status <=2, "status is not valid");
    require(bytes(_role).length != 0, "role is mandatory");

    User memory user = users_[owner];

//    user.creationDate =  _creationDate;
    user.firstName =  _firstName;
    user.lastName =  _lastName;
    user.memberId =  _memberId;
    user.requestId =  _requestId;
    user.role = _role;
    user.status = _status;
    user.owner = owner;

    users_[owner] = user;

    if (isCreate == 0) {
      usersList_.push(owner);
//      if (users_[owner].status != 2) {
      _Members._addUserToMemberRequest(_memberId);
//      }
      users_[owner].groups = ["digit1"];                  // by default
      users_[owner].cmo = _Members.getMemberCmo(user.memberId); // to initialize
    }
  }

  function _memberIdFromCurrentAddress(address addr) view public returns(uint256) {
    return users_[addr].memberId;
  }

  function updateTokens(address addr, uint transactionPrice) public {
    users_[addr].tokens -= transactionPrice;
    _Members.updateMemberTotalTokens(users_[addr].memberId, transactionPrice);
  }

  function getUserTokensByAddress(address addr) view public returns(uint) {
    return users_[addr].tokens;
  }

}
