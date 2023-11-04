require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    }, 
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/hFIALEJYtT_bbifn6qY2sBAsAGh4l7Tl", 
      accounts: ["61405b7fafa67ec6ec884a7b4b6d6b1404263ba93eabdaf95a7120c9274871d3"]
    }
  }
};