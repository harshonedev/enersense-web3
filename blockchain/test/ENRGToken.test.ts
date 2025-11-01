import { expect } from "chai";
import { ethers } from "hardhat";
import { ENRGToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ENRGToken", function () {
  let enrgToken: ENRGToken;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, minter, user] = await ethers.getSigners();
    
    const ENRGToken = await ethers.getContractFactory("ENRGToken");
    enrgToken = await ENRGToken.deploy();
    await enrgToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await enrgToken.name()).to.equal("Energy Token");
      expect(await enrgToken.symbol()).to.equal("ENRG");
    });

    it("Should set the deployer as owner", async function () {
      expect(await enrgToken.owner()).to.equal(owner.address);
    });
  });

  describe("Minter Management", function () {
    it("Should allow owner to set minter", async function () {
      await enrgToken.setMinter(minter.address);
      expect(await enrgToken.minter()).to.equal(minter.address);
    });

    it("Should emit MinterUpdated event", async function () {
      await expect(enrgToken.setMinter(minter.address))
        .to.emit(enrgToken, "MinterUpdated")
        .withArgs(ethers.ZeroAddress, minter.address);
    });

    it("Should not allow non-owner to set minter", async function () {
      await expect(
        enrgToken.connect(user).setMinter(minter.address)
      ).to.be.reverted;
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      await enrgToken.setMinter(minter.address);
    });

    it("Should allow minter to mint tokens", async function () {
      const amount = ethers.parseEther("100");
      await enrgToken.connect(minter).mint(user.address, amount);
      expect(await enrgToken.balanceOf(user.address)).to.equal(amount);
    });

    it("Should not allow non-minter to mint", async function () {
      const amount = ethers.parseEther("100");
      await expect(
        enrgToken.connect(user).mint(user.address, amount)
      ).to.be.revertedWith("Only minter can mint");
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their tokens", async function () {
      await enrgToken.setMinter(minter.address);
      const amount = ethers.parseEther("100");
      await enrgToken.connect(minter).mint(user.address, amount);
      
      await enrgToken.connect(user).burn(ethers.parseEther("50"));
      expect(await enrgToken.balanceOf(user.address)).to.equal(ethers.parseEther("50"));
    });
  });
});
