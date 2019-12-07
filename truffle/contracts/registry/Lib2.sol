pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../../node_modules/solidity-stringutils/strings.sol";

contract Lib2 {

  bool internal hasOverlapResult;

  using strings for *;

  function hasOverlap(bytes _b1, bytes _b2) internal {
    var s1 = string(_b1).toSlice();
    var s2 = string(_b2).toSlice();
    var delim = ",".toSlice();
    var parts1 = new string[](s1.count(delim) + 1);
    var parts2 = new string[](s2.count(delim) + 1);
    if (parts1.length < parts2.length) {
      parts2 = new string[](s1.count(delim) + 1);
      parts1 = new string[](s2.count(delim) + 1);
    }
//    if (parts1.length > parts2.length) {
    for (uint i = 0; i < parts1.length; i++) {  // e.g. parts1.length = 4, parts2.length = 3
      parts1[i] = s1.split(delim).toString();
        for (uint j = 0; j <= i; j++) {
          //          if (keccak256(parts1[j]) == keccak256(parts2[i]) || keccak256(parts1[i]) == keccak256(parts2[j])) { // 0-3,1-3,2-3,3-3,3-2,3-1,3-0
          if (i < parts2.length) {
            parts2[i] = s2.split(delim).toString();
            compareHashes(parts1[j], parts2[i]);
          }
          compareHashes(parts2[j], parts1[i]);
        }
      if (hasOverlapResult) {
        break;
      }
    }
  }

  function compareHashes(string _parts1, string _parts2) private {
    if (keccak256(_parts1) == keccak256(_parts2)) {
      hasOverlapResult = true;
    }
  }
}