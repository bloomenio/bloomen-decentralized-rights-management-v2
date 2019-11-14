pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./Members.sol";

contract Users is Members {


  struct User {
    uint256 creationDate;
    string firstName;
    string lastName;
    uint256 memberId;
    uint256 requestId;
    string role;
    StatusUserEnum status;
    address owner;
  }

  enum StatusUserEnum {
    REJECTED,
    PENDING,
    ACCEPTED
  }

  mapping (address => User) private users_;
  address[] private usersList_;

  uint256 constant private PAGE_SIZE = 10;

  // PUBLIC

  function registerUserRequest(uint256 _creationDate, string _firstName, string _lastName, string _role, uint256 _memberId) public {

    require(_memberId != 0, "No valid memberId");
    require(_creationDate > 0, "CreationDate is mandatory");
    require(users_[msg.sender].creationDate == 0, "User already exists");
    require(_memberExists(_memberId), "Member not exists");

    uint256 _requestId = Random.rand(_creationDate);
    _saveUser(_creationDate, _firstName, _lastName, _memberId, _requestId, _role, uint256(StatusUserEnum.PENDING), msg.sender, 0);
  }

  function updateUser(string _firstName, string _lastName, uint256 _memberId, string _role, address owner) public {

    require(users_[owner].owner > address(0), "This user not exists");
    require(uint(users_[owner].status) == uint(StatusUserEnum.ACCEPTED), "You are not accepted");

    uint256 _requestId = users_[owner].requestId;
    uint256 _creationDate = users_[owner].creationDate;
    uint256 _status = uint(users_[owner].status);

    _saveUser(_creationDate, _firstName, _lastName, _memberId, _requestId, _role, _status, owner, 1);
  }

  function rejectUser(address _userToReject) public {

    require(users_[_userToReject].owner > address(0), "This user not exists");
    require((users_[msg.sender].memberId == users_[_userToReject].memberId) || isSigner(msg.sender), "You cannot accept this user");
    require((uint(users_[msg.sender].status) == uint(StatusUserEnum.ACCEPTED)) || isSigner(msg.sender), "You are not accepted");
    require(users_[_userToReject].status == StatusUserEnum.PENDING, "Only pending users can be rejected");

    users_[_userToReject].status = StatusUserEnum.REJECTED;
    _clearUserFromMemberRequest(users_[_userToReject].memberId, _userToReject);
  }

  function acceptUser(address _userToAccept) public {

    require(users_[_userToAccept].owner > address(0), "This user not exists");
    require((users_[msg.sender].memberId == users_[_userToAccept].memberId) || isSigner(msg.sender), "You cannot accept this user");
    require((uint(users_[msg.sender].status) == uint(StatusUserEnum.ACCEPTED)) || isSigner(msg.sender), "You are not accepted");
    require(users_[_userToAccept].status == StatusUserEnum.PENDING, "Only pending users can be accepted");

    users_[_userToAccept].status = StatusUserEnum.ACCEPTED;
    _clearUserFromMemberRequest(users_[_userToAccept].memberId, _userToAccept);
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

  function whitelistAdmin(address account) public onlySigner {
    _clearUserFromMemberRequest(users_[account].memberId, account);
    users_[account].role = "Super admin";
    users_[account].memberId = 0;
    users_[account].status = StatusUserEnum.ACCEPTED;
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
    //TODO: require
    User memory user = users_[msg.sender];
    return user;
  }

  // PRIVATE

  function _saveUser(uint256 _creationDate, string _firstName, string _lastName, uint256 _memberId,
    uint256 _requestId, string _role, uint256 _status, address owner, uint isCreate) internal {

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
      _addUserToMemberRequest(_memberId);
    }
  }

  function _memberIdFromCurrentAddress() view internal returns(uint256) {
    return users_[msg.sender].memberId;
  }

//  function bytesToUint8(bytes b) public pure returns (uint8){
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
//
//  function parseInt(string _a, uint _b) public returns (uint) {
//    bytes memory bresult = bytes(_a);
//    uint mint = 0;
//    bool decimals = false;
//    for (uint i = 0; i < bresult.length; i++) {
//      if ((bresult[i] >= 48) && (bresult[i] <= 57)) {
//        if (decimals) {
//          if (_b == 0) break;
//          else _b--;
//        }
//        mint *= 10;
//        mint += uint(bresult[i]) - 48;
//      } else if (bresult[i] == 46) decimals = true;
//    }
//    return mint;
//  }

}
