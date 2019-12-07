var Registry = artifacts.require("./registry/Registry");
var Functions = artifacts.require("./registry/Functions");
//
// const duration = {
//   seconds: function(val) { return val},
//   minutes: function(val) { return val * this.seconds(60) },
//   hours:   function(val) { return val * this.minutes(60) },
//   days:    function(val) { return val * this.hours(24) },
//   weeks:   function(val) { return val * this.days(7) },
//   years:   function(val) { return val * this.days(365)}
// };
//

module.exports = function (deployer, network) {
  // const startTime = web3.eth.getBlock('latest').timestamp + duration.minutes(1);
  // const endTime = startTime + duration.minutes(30);
  // const rate = new web3.BigNumber(1000);

  deployer.then(async () => {
    await doDeploy(deployer, network); //, startTime, endTime, rate);
  });
};

async function doDeploy(deployer, network) {
  await deployer.deploy(Registry, Functions); // , {gas: 690000000} :NOT here the problem of bailing, network state unknown. Review successful transactions manually
}


