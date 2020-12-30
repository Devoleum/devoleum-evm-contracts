const Devoleum = artifacts.require("./Devoleum.sol");
const truffleAssert = require("truffle-assertions");

contract("Devoleum", (accounts) => {
  it("Should set the first account as the owner", async () => {
    const devoleum = await Devoleum.deployed();
    assert.equal(await devoleum.owner(), accounts[0]);
  });

  it("Should pause the contract as the owner", async () => {
    const devoleum = await Devoleum.deployed();
    await devoleum.pause();
    assert.equal(await devoleum.paused(), true);
  });

  it("Should UNpause the contract as the owner", async () => {
    const devoleum = await Devoleum.deployed();
    await devoleum.unpause();
    assert.equal(await devoleum.paused(), false);
  });

  it("Should not pause the contract if not the owner", async () => {
    const devoleum = await Devoleum.deployed();
    let user = accounts[1];
    await truffleAssert.reverts(
      devoleum.pause({ from: user }),
      "PauserRole: caller does not have the Pauser role"
    );
    assert.equal(await devoleum.paused(), false);
  });

  it("Should create a Step as a Owner", async () => {
    const devoleum = await Devoleum.deployed();
    let user = accounts[0];
    await devoleum.createStep(
      "ad650168ba21ed543f66e33bd5b3e7cbf205256a3a310e6ad33faf9e",
      "5fece822a559dc86fcace14a",
      {
        from: user,
      }
    );

    let info = await devoleum.getStepInfo(1, { from: user });
    assert.equal(info[1], "5fece822a559dc86fcace14a");
    assert.equal(
      info[2],
      "ad650168ba21ed543f66e33bd5b3e7cbf205256a3a310e6ad33faf9e"
    );
  });

  it("Should NOT create a Step as NOT the Owner", async () => {
    const devoleum = await Devoleum.deployed();
    let user = accounts[1];
    await truffleAssert.reverts(
      devoleum.createStep(
        "ad650168ba21ed543f66e33bd5b3e7cbf205256a3a310e6ad33faf9e",
        "5fece822a559dc86fcace14a",
        {
          from: user,
        }
      ),
      "caller is not the owner"
    );
  });
});
