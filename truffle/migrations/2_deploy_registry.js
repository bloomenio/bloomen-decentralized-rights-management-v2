var Registry = artifacts.require("./registry/Registry");

module.exports = function (deployer, network) {
  deployer.then(async () => {
    await doDeploy(deployer, network);
  });
};

async function doDeploy(deployer, network) {
  await deployer.deploy(Registry);
}


