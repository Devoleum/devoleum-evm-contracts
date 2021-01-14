import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { keccak } from "hash-wasm";

const Verifier = (props) => {
  const [step, setStep] = useState(null);
  const [txMessage, setTxMessage] = useState(null);

  useEffect(() => {
    console.log("fired");
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    const { stepId } = e.target.elements;
    let step = await getData(`${process.env.API_BASE_URL}/api/steps/${stepId.value}`);
    const jsonContent = await getData(step.uri);
    step.calcHash = await calcHash(
      JSON.stringify(jsonContent),
      step.randomizeProof
    );
    setStep(step);
  };

  const getData = async (url) => {
    try {
      const res = await fetch(url);
      const result = await res.json();
      console.log("fetch get: ", result);
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

  const notarizeProof = async () => {
    console.log("get hash: ", step.calcHash)
  
    const accounts = await props.web3.eth.getAccounts();
    await props.contract.methods
      .getStepProofInfo(step.calcHash)
      .send({ from: accounts[0] })
      .then(function (receipt) {
        setTxMessage(receipt.transactionHash)
      });
  };

  return (
    <div class="row">
      <div class="six columns">
        <h4>1. Check Step ID</h4>
        <p>Here you can verify notarized proofs</p>
        <form onSubmit={handleSubmit}>
          <div class="row">
            <div class="six columns">
              <label for="exampleEmailInput">Step id</label>
              <input
                class="u-full-width"
                type="text"
                placeholder=""
                id="stepId"
                value="5ffb9399b44b660004ba402c"
              />
            </div>
          </div>
          <input
            class="button-primary"
            type="submit"
            id="getInfo"
            value="Verify"
          />
        </form>
      </div>
      {step && (
        <div class="six columns" id="stepContainer">
          <h4>2. Notarize</h4>
          <ul>
            <li id="name">{step.name}</li>
            <li id="random">{step.randomizeProof}</li>
            <li>
              Calc Hash (JSON stringify + random):{" "}
              <p id="calchash" style="word-break: break-all">{step.calcHash}</p>
            </li>
          </ul>
          <input
            class="button-primary"
            style="background-color: darkred; border-color: darkred;"
            type="button"
            id="btnnotarize"
            value="Notarize"
            onClick={() => notarizeProof()}
          />
          <div>{txMessage}</div>
        </div>
      )}
    </div>
  );
};

export default Verifier;
