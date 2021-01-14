const Devoleum = artifacts.require("./Devoleum.sol");
const truffleAssert = require("truffle-assertions");

contract("Devoleum", (accounts) => {
  it("Should set the first account as the owner", async () => {
    const devoleum = await Devoleum.deployed();
    assert.equal(await devoleum.owner(), accounts[0]);
  });

  it("Should create a Step Proof as a Owner", async () => {
    const devoleum = await Devoleum.deployed();
    let user = accounts[0];
    let send = devoleum.createStepProof(
      "3bea53f3f773a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea",
      {
        from: user,
      }
    );
    let info = await devoleum.stepIdToStepInfo(1);
    let hashToID = await devoleum.hashToId("3bea53f3f773a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea");
    assert.equal(info[1], "3bea53f3f773a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea");
    assert.equal(hashToID, 1);
  });

  
  it("Should create another Step Proof as a Owner", async () => {
    const devoleum = await Devoleum.deployed();
    let user = accounts[0];
    let send = devoleum.createStepProof(
      "abcv73a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea",
      {
        from: user,
      }
    );
    let info = await devoleum.stepIdToStepInfo(2);
    let hashToID = await devoleum.hashToId("abcv73a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea");
    assert.equal(info[1], "abcv73a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea");
    assert.equal(hashToID, 2);
  });

  it("Should NOT duplicate a Step Proof", async () => {
    const devoleum = await Devoleum.deployed();
    let user = accounts[0];
    await truffleAssert.reverts(
      devoleum.createStepProof(
        "3bea53f3f773a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea",
        {
          from: user,
        }
      ),
      "duplicate"
    );
  });

  it("Should NOT create a Step Proof as NOT the Owner", async () => {
    const devoleum = await Devoleum.deployed();
    let user = accounts[1];
    await truffleAssert.reverts(
      devoleum.createStepProof(
        "3bea53f3f773a4fxxxx85405cbd8537ed9cfceba61ac21ce6480011cba0ea",
        {
          from: user,
        }
      ),
      "caller is not the owner"
    );
  });


});
