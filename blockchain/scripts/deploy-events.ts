import { ethers } from "hardhat";

/**
 * Deploy EnergyEventEmitter contract
 * This contract emits events that kWALA workflows can listen to
 */
async function main() {
  console.log("Deploying EnergyEventEmitter...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy EnergyEventEmitter
  const EnergyEventEmitter = await ethers.getContractFactory("EnergyEventEmitter");
  const emitter = await EnergyEventEmitter.deploy();
  await emitter.waitForDeployment();
  const emitterAddress = await emitter.getAddress();
  
  console.log("✓ EnergyEventEmitter deployed to:", emitterAddress);
  console.log("\n========================================");
  console.log("Add this address to your .env.local:");
  console.log(`NEXT_PUBLIC_ENERGY_EVENT_EMITTER_ADDRESS=${emitterAddress}`);
  console.log("========================================");
  console.log("\nIMPORTANT: Update authorizedEmitter to your API route address");
  console.log("The API route needs to be able to call emitSurplusEnergy()");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

