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
    await devoleum.createStepProof(
      "3bea53f3f773a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea",
      {
        from: user,
      }
    );

    let info = await devoleum.getStepProofInfo(1, { from: user });
    assert.equal(info[1], "3bea53f3f773a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea");
  });

  it("Should NOT create a Step Proof as NOT the Owner", async () => {
    const devoleum = await Devoleum.deployed();
    let user = accounts[1];
    await truffleAssert.reverts(
      devoleum.createStepProof(
        "3bea53f3f773a4f85405cbd8537ed9cfceba61ac21ce6480011cba0ea",
        {
          from: user,
        }
      ),
      "caller is not the owner"
    );
  });


});
