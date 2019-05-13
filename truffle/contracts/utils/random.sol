pragma solidity ^0.4.24;


contract Random {

  function rand(uint seed) internal pure returns (uint) {
    bytes32 data;
    if (seed % 2 == 0){
      data = keccak256(abi.encodePacked(seed)); 
    }else{
      data = keccak256(abi.encodePacked(keccak256(abi.encodePacked(seed))));
    }
    uint sum;
    for(uint i;i < 32;i++){
      sum += uint(data[i]);
    }
    return uint(data[sum % data.length])*uint(data[(sum + 2) % data.length]);
  }
}