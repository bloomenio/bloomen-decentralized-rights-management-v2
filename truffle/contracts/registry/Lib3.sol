pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./Claims.sol";

contract Lib3 is Claims {

  function deleteClaim(uint256 _claimId, bool _claimType, bytes _claimData) public {
    checkClaimStatus(_claimId, _claimType, _claimData, false);
//    claims_[_claimId].deleted = true;

    //    delete claims_[_claimId].claimType;
//    delete claims_[_claimId].claimData;
//    delete claims_[_claimId].creationDate;
//    delete claims_[_claimId].lastChange;
//    delete claims_[_claimId].memberOwner;
//    delete claims_[_claimId].status;
//    claims_[_claimId].claimId = 0;
//
//    uint rowToDelete = userStructs[userAddress].index;
//    address keyToMove = userIndex[userIndex.length-1];
//    userIndex[rowToDelete] = keyToMove;
//    userStructs[keyToMove].index = rowToDelete;
//    userIndex.length=userIndex.length-1;


//    uint claimIdToDelete = _claimId;
//    uint claimIdToMove = claimIdIndex[claimIdIndex.length-1];
//    claimIdIndex[claimIdToDelete] = claimIdToMove;
//    claims_[claimIdToMove].claimId = claimIdToDelete;
//    claimIdIndex.length=claimIdIndex.length-1;
//    claimIdCounter_-=1;
//    maxSplits_;

    // try to do it without claimIdIndex[]
//    uint claimIdToDelete = _claimId;
//    uint claimIdToMove = claims_[claimIdCounter_-1].claimId;
//    claims_[_claimId].claimId = claimIdToMove;
//    claims_[claimIdToMove].claimId = _claimId;
//    maxSplits_[_claimId] = uint16(claimIdToMove);
//    maxSplits_[claimIdToMove] = uint16(_claimId);
//    claimIdCounter_-=1;


//    claims_[_claimId].creationDate = 0;
//    claims_[_claimId].claimType = false;
//    delete claims_[_claimId].claimData;
//    claims_[_claimId].memberOwner = 0;
//    claims_[_claimId].lastChange = 0;
//    claims_[_claimId].status = false;
//    claims_[_claimId].claimId = 0;
  }

}