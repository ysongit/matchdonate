import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("MockUSDC", {
    from: deployer,
    args: [1000000],
    log: true,
    autoMine: true,
  });

  const MockUSDC = await hre.ethers.getContract<Contract>("MockUSDC", deployer);

  await deploy("GivingFundToken", {
    from: deployer,
    args: [await MockUSDC.getAddress()],
    log: true,
    autoMine: true,
  });

  const newOwner = "0x515567D486C8927f607C611a99a941c670975992";

  const GivingFundToken = await hre.ethers.getContract<Contract>("GivingFundToken", deployer);
  console.log(`👋 Transfer Ownership to : ${newOwner}`, await GivingFundToken.transferOwnership(newOwner));

  await deploy("BespokeFundTokenFactory", {
    from: deployer,
    args: [await GivingFundToken.getAddress()],
    log: true,
    autoMine: true,
  });
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
