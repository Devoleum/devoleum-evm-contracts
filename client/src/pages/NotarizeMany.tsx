/** @jsxImportSource solid-js */
import { Component, createSignal, For } from "solid-js";
import { IStep } from "../models/IStep";
import { calcHash, getData } from "../utils/api";
import { IPageProps } from "../models/IPage";
import Login from "../components/Login";

const NotarizeMany: Component<IPageProps> = (props: IPageProps) => {
  const [steps, setSteps] = createSignal<IStep[]>([] as IStep[]);
  const [stepsCounter, setStepsCounter] = createSignal(0);
  const [txMessage, setTxMessage] = createSignal("");
  const blockchainNameAttr =
    props.blockchainName === "Polygon Matic"
      ? "polygon_matic_notarization"
      : "test_eth_notarization";

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { historyId } = e.target.elements;
    let steps = await getData(
      `${process.env.VITE_API_BASE_URL}/api/steps/history/${historyId.value}/steps`
    );
    for (let step of steps) {
      await populateStep(step);
    }
    setSteps(steps);
  };

  const populateStep = async (step: IStep) => {
    const jsonContent = await getData(step.uri);
    step.calcHash = await calcHash(
      JSON.stringify(jsonContent),
      step.randomizeProof
    );
  };

  const notarizeProof = async (calcHash, stepId, idx) => {
    console.log("get hash: ", calcHash, "get id: ", stepId);
    const tx = await props.contract.createStepProof(calcHash);

    await tx.wait();
    let txurl;

    if (!tx.hash) {
      console.error("emtpy txhash");
      return;
    }
    if (props.blockchainName === "Ethereum Rinkeby") {
      txurl = `https://rinkeby.etherscan.io/tx/${tx.hash}`.toString();
    }
    if (props.blockchainName === "Polygon Matic") {
      txurl = `https://polygonscan.com/tx/${tx.hash}`.toString();
    }
    console.log("get tx hash: ", txurl);
    setTxMessage(txurl);
    const jsonRes = await notarizeMongo(
      txurl,
      calcHash,
      stepId,
      props.blockchainName
    );
    let updatedSteps = [...steps()];
    updatedSteps[idx] = jsonRes;
    setSteps(updatedSteps);
  };

  const notarizeMongo = async (
    txurl: string,
    calchash: string,
    stepId: string,
    chainName: string
  ) => {
    const response = await fetch(
      `${process.env.VITE_API_BASE_URL}/api/steps/evm/${stepId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("userInfo") || "").token
          }`,
        },
        body: JSON.stringify({
          txurl: txurl,
          calchash: calchash,
          chainName: chainName,
        }),
      }
    );
    const jsonRes = await response.json();
    console.log("get notarizeMongo response: ", jsonRes);

    return jsonRes;
  };

  return (
    <div>
      <h2 class="sub-title">Notarizer</h2>
      <div>
        <Login />

        <div class="row">
          <div>
            <h4>1. Get Steps</h4>
            <p>Here the admin can notarize multiple proofs</p>
            <div>
              <a href={txMessage()} target="_blank">
                {txMessage()}
              </a>
            </div>
            <form onSubmit={handleSubmit}>
              <div class="row">
                <input
                  class="input"
                  type="text"
                  placeholder="History id"
                  id="historyId"
                />
              </div>
              <input
                class="button"
                type="submit"
                id="getInfo"
                value="Get Info"
              />
            </form>
          </div>
          {steps && (
            <div class="twelve columns" id="stepContainer">
              <h4>2. Notarize {stepsCounter}</h4>
              <table class="u-full-width" id="stepTable">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Notarize</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={steps()} fallback={<div>Loading...</div>}>
                    {(step, idx) => (
                      <tr key={step._id}>
                        <td>
                          {step.name}
                          {!step[blockchainNameAttr] && (
                            <div style={{ wordBreak: "break-all" }}>
                              {step.calcHash}
                            </div>
                          )}
                        </td>
                        <td align="center">
                          {step[blockchainNameAttr] ? (
                            <div align="center">Done</div>
                          ) : (
                            <input
                              class="button"
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
                    )}
                  </For>
                </tbody>
              </table>

              <div>{txMessage()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotarizeMany;
