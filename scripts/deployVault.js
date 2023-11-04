const hre = require("hardhat");
const {ethers} = require("hardhat")

async function main() {

  const Vault = await ethers.getContractFactory("Vault")
  const vault = await Vault.deploy();

  console.log(vault.target)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
