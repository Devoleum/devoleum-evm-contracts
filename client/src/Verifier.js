import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { keccak } from "hash-wasm";

const Verifier = (props) => {
  const [step, setStep] = useState(null);
  const [proof, setProof] = useState(null);
  const [proofDate, setProofDate] = useState(null);
  const [message, setMessage] = useState(null);
  const [ethHash, setEthHash] = useState(null);
  const [error, setError] = useState(null);
  let { id = null } = useParams();
  const [itemId, setItemId] = useState(id);
  const [blockchainName, setBlockchainName] = useState(props.blockchainName);

  const getDevoleumStep = async () => {
    let step = await getData(`${process.env.API_BASE_URL}/api/steps/${itemId}`);
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

    console.log(blockchainStep);
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
    <div>
      <div>
        <span className="label">Please insert the Step ID</span>
      </div>
      <input
        className="input"
        type="text"
        onChange={(e) => setItemId(e.target.value)}
        value={itemId}
      />
      <div>
        <button className="button" onClick={() => getDevoleumStep()}>
          Verify Step
        </button>
      </div>
      <span>{error}</span>
      <br />
      <br />
      {proof && (
        <div>
          <div className="tab-with-corner">
            Devoleum Step{" - "}
            {proof === step.calcHash ? (
              <span style={{ color: " #44f1a6" }}>Matching</span>
            ) : (
              <span style={{ color: "red" }}>Not Matching</span>
            )}
          </div>
          <div className="boxed">
            <div>
              <span className="label">Step ID: </span>
              {step._id}
            </div>
            <div>
              <span className="label">Step name: </span>
              <a
                href={"https://app.devoleum.com/step/" + step._id}
                target="_blank"
                rel="noopener noreferrer"
              >
                {step.name}
              </a>
            </div>
            <div>
              <span className="label">JSON hash: </span>
              {step.calcHash}
            </div>
            <div>
              <span className="label">{blockchainName} hash: </span>
              {proof}
            </div>
            <div>
              <span className="label">{blockchainName} tx: </span>
              <a
                href={step[blockchainName === 'Polygon Matic' ? 'polygon_matic_notarization' : 'test_eth_notarization']}
                target="_blank"
                rel="noopener noreferrer"
              >
                {step.test_eth_notarization}
              </a>
            </div>
            <div>
              <span className="label">JSON link: </span>
              <a href={step.uri} target="_blank" rel="noopener noreferrer">
                {step.uri}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verifier;
