import React, { useState, useEffect } from "react";
import { keccak } from "hash-wasm";

const NotarizeMany = (props) => {
  const [steps, setSteps] = useState(null);
  const [stepsCounter, setStepsCounter] = useState(null);
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

  const notarizeProof = async (calcHash, stepId) => {
    console.log("get hash: ", calcHash, "get id: ", stepId);
    const accounts = await props.web3.eth.getAccounts();
    await props.contract.methods
      .createStepProof(calcHash)
      .send({ from: accounts[0] }, async (error, txhash) => {
        if (error) {
          console.error("error: ", error);
          return;
        }
        if (!txhash) {
          console.error("emtpy txhash");
          return;
        }
        const txurl = (`https://rinkeby.etherscan.io/tx/${txhash}`).toString()
        console.log("get tx hash: ", txurl);
        setTxMessage(txurl);
        await notarizeMongo(txurl, calcHash, stepId);
      });
  };

  const notarizeMongo = async (txurl, calchash, stepId) => {
    const response = await fetch(
      `${process.env.API_BASE_URL}/api/steps/rinkeby/${stepId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}`,
        },
        body: JSON.stringify({txurl: txurl, calchash: calchash}),
      }
    );
    console.log("get notarizeMongo response: ", response);

  }

  return (
    <div className="row">
      <div>
        <h4>1. Get Steps</h4>
        <p>Here the admin can notarize multiple proofs</p>
        <div>
          <a href={txMessage} target="_blank">
            {txMessage}
          </a>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <input
              className="input"
              type="text"
              placeholder="History id"
              id="historyId"
            />
          </div>
          <input
            className="button"
            type="submit"
            id="getInfo"
            value="Get Info"
          />
        </form>
      </div>
      {steps && (
        <div className="twelve columns" id="stepContainer">
          <h4>2. Notarize {stepsCounter}</h4>
          <table className="u-full-width" id="stepTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Notarize</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, idx) => (
                <tr key={step._id}>
                  <td>
                    {step.name}
                    {!step.test_eth_notarization && (
                      <div style={{ wordBreak: "break-all" }}>
                        {step.calcHash}
                      </div>
                    )}
                  </td>
                  <td align="center">
                    {step.test_eth_notarization ? (
                      <div align="center">Done</div>
                    ) : (
                      <input
                        className="button"
                        type="button"
                        id="btnnotarize"
                        value="GO"
                        onClick={() =>
                          notarizeProof(step.calcHash, step._id, idx)
                        }
                      />
                    )}
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