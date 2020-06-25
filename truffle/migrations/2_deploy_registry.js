const Members = artifacts.require("./registry/Members");
const Users = artifacts.require("./registry/Users");
const Claims = artifacts.require("./registry/Claims");

module.exports = function (deployer, network) {
  var membersInstance, usersInstance;
  // deployer.deploy(Members)
  //     // .then(() => Members.deployed())
  //     .then((memInst) => {
  //       membersInstance = memInst;
  //       return deployer.deploy(Users, membersInstance.address)
  //           // .then(() => Users.deployed())
  //           .then((usrInst) => {
  //             usersInstance = usrInst;
  //             return deployer.deploy(Claims, usersInstance.address, membersInstance.address)
  //           });
  //     });
    deployer.deploy(Members)
        .then(() => Members.deployed())
        .then(memInst => {
            membersInstance = memInst;
            return deployer.deploy(Users, memInst.address);
        })
        .then(() => Users.deployed())
        .then(users => deployer.deploy(Claims, users.address, membersInstance.address));

    // deployer.then(async () => {
  //   await doDeploy(deployer, network);
  // });
};


async function doDeploy(deployer, network) {
  // await deployer.deploy(Claims);
  // deployer.link(Users, Functions);
  // deployer.deploy(Functions);
  // deployer.deploy(Users);
  // deployer.deploy(Functions, Users.address);
  // await Users.link(Functions.address);

  await deployer.deploy(Users).then((instanceOfUsers) => {
    // console.log("Users    ", instanceOfUsers.address);
    return deployer.deploy(Claims, instanceOfUsers.address)
  });

  // await deployer.deploy(Registry)
  //   .then((instanceOfRegistry) => {
  //       // console.log(network);
  //       return deployer.deploy(Users, instanceOfRegistry.address)
  //         .then((instanceOfUsers) => {
  //           // console.log("Users    ", instanceOfUsers.address);
  //           return deployer.deploy(Claims, instanceOfUsers.address)
  //         });
  //   });

  // console.log("Functions    ", Functions.address);
  // await deployer.deploy(Registry)
  //     .then(() => Registry.deployed())
  //     .then(registry => deployer.deploy(Users, registry.address))
  //     .then(() => Users.deployed())
  //     .then(users => deployer.deploy(Claims, users.address));

}

