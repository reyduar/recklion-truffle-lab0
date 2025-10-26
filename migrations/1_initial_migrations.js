var ganache = artifacts.require("GanacheLab0");

module.exports = function (deployer) {
  // deployment steps
  deployer.deploy(ganache);
};
