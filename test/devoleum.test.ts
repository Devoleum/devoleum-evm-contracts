import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Devoleum } from "../typechain-types";

describe("Devoleum", function () {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let devoleum: Devoleum;

  beforeEach(async function () {
    const Devoleum = await ethers.getContractFactory("Devoleum");
    devoleum = await Devoleum.deploy();
    await devoleum.deployed();

    [owner, addr1] = await ethers.getSigners();
  });

  it("Should set the first account as the owner", async () => {
    expect(await devoleum.owner()).to.equal(owner.address);
  });

  it("Should create a Step Proof as a Owner", async () => {
    let tx = await devoleum
      .connect(owner)
      .createStepProof(
        "3bea53f3f773a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea"
      );
    await tx.wait();
    let info = await devoleum.stepIdToStepInfo(1);
    let hashToID = await devoleum.hashToId(
      "3bea53f3f773a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea"
    );

    expect(info.hashOfJson).to.equal(
      "3bea53f3f773a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea"
    );
    expect(hashToID).to.equal(1);
  });

  it("Should create another Step Proof as a Owner", async () => {
    await devoleum
      .connect(owner)
      .createStepProof("abdv73a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea");
    let tx = await devoleum
      .connect(owner)
      .createStepProof("abcv73a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea");

    await tx.wait();

    let info = await devoleum.stepIdToStepInfo(2);
    let hashToID = await devoleum.hashToId(
      "abcv73a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea"
    );
    expect(info.hashOfJson).to.equal(
      "abcv73a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea"
    );
    expect(hashToID).to.equal(2);
  });

  it("Should NOT duplicate a Step Proof", async () => {
    let tx = await devoleum.createStepProof(
      "3bea53f3f773a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea"
    );
    await tx.wait();

    await expect(
      devoleum
        .connect(owner)
        .createStepProof(
          "3bea53f3f773a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea"
        )
    ).to.be.revertedWith("duplicate");
  });
  it("Should NOT create a Step Proof as NOT the Owner", async () => {
    await expect(
      devoleum
        .connect(addr1)
        .createStepProof(
          "3bea53f3f773a4fxxxx85405cbd8537ed9cfceba61ac21ce6480011cba0ea"
        )
    ).to.be.revertedWith("Only owner can call this function");
  });
});
