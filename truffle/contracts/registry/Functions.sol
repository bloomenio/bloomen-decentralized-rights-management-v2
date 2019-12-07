pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./Claims.sol";

contract Functions is Claims {

  function getClaim(uint256 _claimId) view public returns (Claim) {
    return claims_[_claimId];
  }


}