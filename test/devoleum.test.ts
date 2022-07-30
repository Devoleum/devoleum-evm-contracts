import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Devoleum } from "../typechain-types";

describe("Devoleum", function () {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addrAllowed: SignerWithAddress;
  let devoleum: Devoleum;

  beforeEach(async function () {
    const Devoleum = await ethers.getContractFactory("Devoleum");
    devoleum = await Devoleum.deploy(
      "0x0000000000000000000000000000000000000000"
    );
    await devoleum.deployed();

    [owner, addr1, addrAllowed] = await ethers.getSigners();
  });

  it("Should set the first account as the owner", async () => {
    expect(await devoleum.owner()).to.equal(owner.address);
  });

  it("Should create a Step Proof as a Owner", async () => {
    let tx = await devoleum
      .connect(owner)
      .createStepProof(
        "0x51e06a0cc6e6df1d07c55ce8a293172a44a4d9459fe9f99b3ec2c31b49dcb84c"
      );
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;

    await tx.wait();
    let hashDate = await devoleum.hashToDate(
      "0x51e06a0cc6e6df1d07c55ce8a293172a44a4d9459fe9f99b3ec2c31b49dcb84c"
    );

    expect(hashDate.toNumber()).to.greaterThan(0);
    expect(hashDate).to.equal(timestampBefore);
  });

  it("Should NOT duplicate a Step Proof", async () => {
    let tx = await devoleum.createStepProof(
      "0x51e06a0cc6e6df1d07c55ce8a293172a44a4d9459fe9f99b3ec2c31b49dcb84c"
    );
    await tx.wait();

    await expect(
      devoleum
        .connect(owner)
        .createStepProof(
          "0x51e06a0cc6e6df1d07c55ce8a293172a44a4d9459fe9f99b3ec2c31b49dcb84c"
        )
    ).to.be.revertedWith("duplicate");
  });
  it("Should NOT create a Step Proof as NOT the Owner or Allowed", async () => {
    await expect(
      devoleum
        .connect(addr1)
        .createStepProof(
          "0x61e06a0cc6e6df1d07c55ce8a293172a44a4d9459fe9f99b3ec2c31b49dcb84c"
        )
    ).to.be.revertedWith("Only allowed");
  });
  it("Should let the Owner toggle an Allowed address", async () => {
    await devoleum.connect(owner).toggleAllowed(addrAllowed.address);
    expect(await devoleum.allowed(addrAllowed.address)).to.equal(true);
  });
  it("Should let the Allowed to disable own address", async () => {
    await devoleum.connect(owner).toggleAllowed(addrAllowed.address);
    expect(await devoleum.allowed(addrAllowed.address)).to.equal(true);
    await devoleum.connect(addrAllowed).selfDisableAllowed();
    expect(await devoleum.allowed(addrAllowed.address)).to.equal(false);
  });
  it("Should NOT let NOT Allowed to disable own address", async () => {
    expect(await devoleum.allowed(addrAllowed.address)).to.equal(false);
    await expect(
      devoleum.connect(addrAllowed).selfDisableAllowed()
    ).to.be.revertedWith("Only allowed");
  });

  it("Should NOT let non Owner to toggle an Allowed address", async () => {
    await expect(
      devoleum.connect(addr1).toggleAllowed(addr1.address)
    ).to.be.revertedWith("Only owner");

    expect(await devoleum.allowed(addr1.address)).to.equal(false);
  });

  it("Should NOT let an Allowed to toggle an Allowed address", async () => {
    await devoleum.connect(owner).toggleAllowed(addrAllowed.address);
    await expect(
      devoleum.connect(addrAllowed).toggleAllowed(addr1.address)
    ).to.be.revertedWith("Only owner");
    expect(await devoleum.allowed(addrAllowed.address)).to.equal(true);
  });

  it("Should create a Step Proof as ALLOWED", async () => {
    await devoleum.connect(owner).toggleAllowed(addrAllowed.address);

    let tx = await devoleum
      .connect(addrAllowed)
      .createStepProof(
        "0x71e06a0cc6e6df1d07c55ce8a293172a44a4d9459fe9f99b3ec2c31b49dcb84c"
      );
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;

    await tx.wait();
    let hashDate = await devoleum.hashToDate(
      "0x71e06a0cc6e6df1d07c55ce8a293172a44a4d9459fe9f99b3ec2c31b49dcb84c"
    );

    expect(hashDate.toNumber()).to.greaterThan(0);
    expect(hashDate).to.equal(timestampBefore);
  });

  it("Should allow Owner to transfer ownership", async () => {
    await devoleum.connect(owner).transferOwnership(addr1.address);
    expect(await devoleum.owner()).to.equal(addr1.address);
  });
  it("Should NOT allow NOT Owner to transfer ownership", async () => {
    await expect(
      devoleum.connect(addr1).transferOwnership(addr1.address)
    ).to.be.revertedWith("Only owner");
    expect(await devoleum.owner()).to.equal(owner.address);
  });
  it("Should NOT allow Allowed to transfer ownership", async () => {
    await devoleum.connect(owner).toggleAllowed(addrAllowed.address);
    expect(await devoleum.allowed(addrAllowed.address)).to.equal(true);
    await expect(
      devoleum.connect(addrAllowed).transferOwnership(addr1.address)
    ).to.be.revertedWith("Only owner");
    expect(await devoleum.owner()).to.equal(owner.address);
  });

  it("Should allow new Owner to create a Step Proof", async () => {
    await devoleum.connect(owner).transferOwnership(addr1.address);
    expect(await devoleum.owner()).to.equal(addr1.address);

    let tx = await devoleum
      .connect(addr1)
      .createStepProof(
        "0x81e06a0cc6e6df1d07c55ce8a293172a44a4d9459fe9f99b3ec2c31b49dcb84c"
      );
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;

    await tx.wait();
    let hashDate = await devoleum.hashToDate(
      "0x81e06a0cc6e6df1d07c55ce8a293172a44a4d9459fe9f99b3ec2c31b49dcb84c"
    );

    expect(hashDate.toNumber()).to.greaterThan(0);
    expect(hashDate).to.equal(timestampBefore);
  });

  it("Should new Owner to to toggle an Allowed address", async () => {
    await devoleum.connect(owner).transferOwnership(addr1.address);
    expect(await devoleum.owner()).to.equal(addr1.address);
    await devoleum.connect(addr1).toggleAllowed(addrAllowed.address);
    expect(await devoleum.allowed(addrAllowed.address)).to.equal(true);
  });
});
