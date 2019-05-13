const mvn = require('maven').create();

// From standard-version hook
console.log(process.argv);
let versionNumber = process.argv[2];

// Any intelligent logic here?
if (true) {
  versionNumber += '-SNAPSHOT';
}

console.log(`Versioning pom.xml with version ${versionNumber}`);

mvn.execute(
  ['versions:set', 'versions:commit'],
  {newVersion: versionNumber}
);
