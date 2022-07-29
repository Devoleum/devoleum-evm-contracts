/** @jsxImportSource solid-js */
import { Component, createSignal, For, Show } from "solid-js";
import { IStep } from "../models/IStep";
import { calcHash, getData } from "../utils/api";
import Login from "../components/Login";
import { useBlockhain } from "../components/BlockchainCtx";
import { IPageProps } from "../models/IPage";
import { chainEnum } from "../models/ContractAddress";

const NotarizeMany: Component<IPageProps> = (props) => {
  const [steps, setSteps] = createSignal<IStep[]>([] as IStep[]);
  const [txMessage, setTxMessage] = createSignal("");
  const blockchainNameAttr: string =
    props.contract.address === chainEnum.POLYGON
      ? "polygon_matic_v2_notarization"
      : "sepolia_test_eth_notarization";

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { historyId } = e.target.elements;
    let steps = await getData(
      `${import.meta.env.VITE_API_BASE_URL}/api/steps/history/${
        historyId.value
      }`
    );
    console.log(steps);

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

  const notarizeProof = async (
    calcHash: string,
    stepId: string,
    idx: number
  ) => {
    console.log("get hash: ", calcHash, "get id: ", stepId);
    console.log("get signer: ", props.signer);

    if (!props.signer) return;
    const devoleumWithSigner = props.contract.connect(props.signer);
    const tx = await devoleumWithSigner.createStepProof(`0x${calcHash}`);

    await tx.wait();
    console.log("tx: ", tx.hash);

    let txurl = "";

    if (!tx.hash) {
      console.error("emtpy txhash");
      return;
    }
    if (props.contract.address === chainEnum.SEPOLIA) {
      txurl = `https://sepolia.etherscan.io/tx/${tx.hash}`;
    }
    if (props.contract.address === chainEnum.POLYGON) {
      txurl = `https://polygonscan.com/tx/${tx.hash}`;
    }
    console.log("get tx hash: ", txurl);
    setTxMessage(txurl);
    const jsonRes = await notarizeMongo(txurl, calcHash, stepId);
    let updatedSteps = [...steps()];
    updatedSteps[idx] = jsonRes;
    setSteps(updatedSteps);
  };

  const notarizeMongo = async (
    txurl: string,
    calchash: string,
    stepId: string
  ) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/steps/evm/${stepId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("userInfo")).token
          }`,
        },
        body: JSON.stringify({
          txurl: txurl,
          hash: calchash,
          chain_name: blockchainNameAttr,
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
        <Show
          when={props.signer && localStorage.getItem("userInfo")}
          fallback={<Login />}
        >
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
                <h4>2. Notarize</h4>
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
                        <tr>
                          <td>
                            {step.randomizeProof}
                            {step.name}
                            {!step[blockchainNameAttr] && (
                              <div style={{ wordBreak: "break-all" }}>
                                {step.calcHash}
                              </div>
                            )}
                          </td>
                          <td>
                            {step[blockchainNameAttr] ? (
                              <div>Done</div>
                            ) : (
                              <input
                                class="button"
                                type="button"
                                id="btnnotarize"
                                value="GO"
                                onClick={() =>
                                  notarizeProof(
                                    step.calcHash ? step.calcHash : "",
                                    step._id.$oid,
                                    idx()
                                  )
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
        </Show>
      </div>
    </div>
  );
};

export default NotarizeMany;
