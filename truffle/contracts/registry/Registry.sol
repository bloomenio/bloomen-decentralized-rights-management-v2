pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./SignerRole.sol";

contract Registry is SignerRole {

  string[] private cmos_;

  function addCMO(string memory _cmo) onlySigner public {
    cmos_.push(_cmo);
  }

  function deleteCMO(uint _index) onlySigner public {
    for (uint i = _index; i < cmos_.length-1;i++){
      cmos_[i] = cmos_[i+1];
    }
    delete cmos_[cmos_.length-1];
    cmos_.length--;
  }

  function getCMOs() view public returns( string[] memory ) {
    return cmos_;
  }

}