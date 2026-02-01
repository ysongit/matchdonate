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

  const TestUSDCOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  // const TestUSDCOwner = "";

  const MockUSDC = await hre.ethers.getContract<Contract>("MockUSDC", deployer);
  console.log(`👋 Mint 10000000000 TEST USDC to: ${TestUSDCOwner}`, await MockUSDC.mint(TestUSDCOwner, 10000000000));

  await deploy("GivingFundToken", {
    from: deployer,
    args: [await MockUSDC.getAddress()],
    log: true,
    autoMine: true,
  });

  const newOwner = "0x515567D486C8927f607C611a99a941c670975992";
  //  const newOwner = "";

  const GivingFundToken = await hre.ethers.getContract<Contract>("GivingFundToken", deployer);

  await deploy("BespokeFundTokenFactory", {
    from: deployer,
    args: [await GivingFundToken.getAddress()],
    log: true,
    autoMine: true,
  });

  const BespokeFundTokenFactory = await hre.ethers.getContract<Contract>("BespokeFundTokenFactory", deployer);

  await deploy("MatchingFundTokenFactory", {
    from: deployer,
    args: [await GivingFundToken.getAddress()],
    log: true,
    autoMine: true,
  });

  const MatchingFundTokenFactory = await hre.ethers.getContract<Contract>("MatchingFundTokenFactory", deployer);

  console.log(`👋 Authorize Minter : ${await BespokeFundTokenFactory.getAddress()}`, await GivingFundToken.authorizeMinter(await BespokeFundTokenFactory.getAddress()));
  console.log(`👋 Authorize Minter : ${await MatchingFundTokenFactory.getAddress()}`, await GivingFundToken.authorizeMinter(await MatchingFundTokenFactory.getAddress()));
  console.log(`👋 Transfer Ownership to : ${newOwner}`, await GivingFundToken.transferOwnership(newOwner));

  await deploy("GiftBox", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
