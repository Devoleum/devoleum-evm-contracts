import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { keccak } from "hash-wasm";

const NotarizeMany = (props) => {
  const [steps, setSteps] = useState(null);
  const [txMessage, setTxMessage] = useState(null);

  useEffect(() => {
    console.log("fired");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { historyId } = e.target.elements;
    let steps = await getData(
      `${process.env.API_BASE_URL}/api/steps/history/${historyId.value}/steps`
    );
    for (let step of steps) {
      await populateStep(step);
    }
    setSteps(steps);
  };

  const populateStep = async (step) => {
    const jsonContent = await getData(step.uri);
    step.calcHash = await calcHash(
      JSON.stringify(jsonContent),
      step.randomizeProof
    );
  };

  const getData = async (url) => {
    try {
      const res = await fetch(url);
      const result = await res.json();
      return result;
    } catch (error) {
      if (error) {
        console.log("error is here: ", error);
      }
    }
    return;
  };

  const calcHash = async (content, random) => {
    const hash = await keccak(content + random, 256);
    return hash;
  };

  const notarizeProof = async (calcHash) => {
    console.log("get hash: ", calcHash);

    const accounts = await props.web3.eth.getAccounts();
    await props.contract.methods
      .createStepProof(calcHash)
      .send({ from: accounts[0] })
      .then(function (receipt) {
        setTxMessage(receipt.transactionHash);
        console.log("get transactionHash: ", receipt);
      });
  };

  return (
    <div class="row">
      <div class="six columns">
        <h4>1. Get Steps</h4>
        <p>Here the admin can notarize proofs</p>
        <form onSubmit={handleSubmit}>
          <div class="row">
            <div class="six columns">
              <label for="exampleEmailInput">History id</label>
              <input
                class="u-full-width"
                type="text"
                placeholder=""
                id="historyId"
                value="5ffb87240fd1c30004878d7e"
              />
            </div>
          </div>
          <input
            class="button-primary"
            type="submit"
            id="getInfo"
            value="Get Info"
          />
        </form>
      </div>
      {steps && (
        <div class="six columns" id="stepContainer">
          <h4>2. Notarize</h4>
          <table class="u-full-width" id="stepTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>^</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step) => (
                <tr>
                  <td>
                    {step.name}
                    <div style="word-break: break-all">{step.calcHash}</div>
                  </td>
                  <td>
                    <input
                      class="button-primary"
                      style="background-color: darkred; border-color: darkred;"
                      type="button"
                      id="btnnotarize"
                      value="GO"
                      onClick={() => notarizeProof(step.calcHash)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>{txMessage}</div>
        </div>
      )}
    </div>
  );
};

export default NotarizeMany;
