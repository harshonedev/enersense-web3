import { ethers } from "hardhat";

async function main() {
  console.log("Deploying EnerSense contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy ENRG Token
  console.log("\n1. Deploying ENRG Token...");
  const ENRGToken = await ethers.getContractFactory("ENRGToken");
  const enrgToken = await ENRGToken.deploy();
  await enrgToken.waitForDeployment();
  const enrgAddress = await enrgToken.getAddress();
  console.log("✓ ENRG Token deployed to:", enrgAddress);

  // Deploy VoucherMinter
  console.log("\n2. Deploying VoucherMinter...");
  const VoucherMinter = await ethers.getContractFactory("VoucherMinter");
  const voucherMinter = await VoucherMinter.deploy(
    enrgAddress,
    deployer.address // Initial signer (will be updated to kWALA workflow address)
  );
  await voucherMinter.waitForDeployment();
  const minterAddress = await voucherMinter.getAddress();
  console.log("✓ VoucherMinter deployed to:", minterAddress);

  // Set minter in ENRG Token
  console.log("\n3. Setting VoucherMinter as authorized minter...");
  const tx1 = await enrgToken.setMinter(minterAddress);
  await tx1.wait();
  console.log("✓ Minter authorized");

  // Deploy Marketplace
  console.log("\n4. Deploying EnergyMarketplace...");
  const EnergyMarketplace = await ethers.getContractFactory("EnergyMarketplace");
  const marketplace = await EnergyMarketplace.deploy(enrgAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✓ EnergyMarketplace deployed to:", marketplaceAddress);

  // Summary
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("========================================");
  console.log("ENRG Token:", enrgAddress);
  console.log("VoucherMinter:", minterAddress);
  console.log("EnergyMarketplace:", marketplaceAddress);
  console.log("========================================");
  console.log("\nAdd these addresses to your .env.local:");
  console.log(`NEXT_PUBLIC_ENRG_TOKEN_ADDRESS=${enrgAddress}`);
  console.log(`NEXT_PUBLIC_VOUCHER_MINTER_ADDRESS=${minterAddress}`);
  console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
  console.log("\nIMPORTANT: Update the signer in VoucherMinter to your kWALA workflow address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
