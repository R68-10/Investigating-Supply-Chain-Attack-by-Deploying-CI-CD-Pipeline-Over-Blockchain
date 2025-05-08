require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28", // Match this with your contract's pragma
  networks: {
    besu: {
      url: "http://172.17.0.3:8555",
      chainId: 1337,
      accounts: [
        "0x14469d55bf7f739053fb69256e42327c91d678c3fd36fe38c05aa544b931c861",
        "0x4ef37de0b57def4f68def40b950e1277fbfe5a702c582de09883710aaceddaa0"
      ]
      
    }
  }
};