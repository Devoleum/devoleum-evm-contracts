import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { keccak } from "hash-wasm";

const Verifier = (props) => {
  const [step, setStep] = useState(null);
  const [proof, setProof] = useState(null);
  const [proofDate, setProofDate] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    console.log("fired");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { stepId } = e.target.elements;
    let step = await getData(
      `${process.env.API_BASE_URL}/api/steps/${stepId.value}`
    );
    const jsonContent = await getData(step.uri);
    step.calcHash = await calcHash(
      JSON.stringify(jsonContent),
      step.randomizeProof
    );
    setStep(step);
    await getProof(step.calcHash);
  };
  const getProof = async (hashJson) => {
    const arrayId = await props.contract.methods.hashToId(hashJson).call();

    const blockchainStep = await props.contract.methods
      .stepIdToStepInfo(arrayId)
      .call();

    console.log(blockchainStep)
    await setProof(blockchainStep[1]);
    await setProofDate(new Date(blockchainStep[0] * 1000).toISOString());
    await setMessage(
      hashJson.toString() === blockchainStep[1].toString() ? (
        <div style={{ color: "green" }}>Success, exact match!</div>
      ) : (
        <div style={{ color: "red" }}>Epic fail, are not the same!</div>
      )
    );
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

  return (
    <div class="row">
      <div class="six columns">
        <h4>1. Insert Step ID</h4>
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
          <h4>2. Check</h4>
          <strong>{message}</strong>
          <ul>
            <li>{step.name}</li>
            <li>{step.randomizeProof}</li>
            <li>
              Calc Hash (JSON stringify + random):{" "}
              <p id="calchash" style="word-break: break-all">
                {step.calcHash}
              </p>
            </li>
            <li>
              Blockchain proof({proofDate}):{" "}
              <p id="calchash" style="word-break: break-all">
                {proof}
              </p>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Verifier;
