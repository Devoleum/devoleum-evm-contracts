/** @jsxImportSource solid-js */
import { useParams } from "solid-app-router";
import { Component, createSignal } from "solid-js";

import { IStep } from "../models/IStep";
import { calcHash, getData } from "../utils/api";
import { IPageProps } from "../models/IPage";

const Verifier: Component<IPageProps> = (props: IPageProps) => {
  let { id = "5ffb9399b44b660004ba402c" } = useParams();
  console.log("id; ", id);

  const [step, setStep] = createSignal<IStep>({} as IStep);
  const [hash, setHash] = createSignal<string>("");
  const [proof, setProof] = createSignal(null);
  const [error, setError] = createSignal("");
  const [itemId, setItemId] = createSignal<string>(id);

  const blockchainNameAttr =
    props.blockchainName === "Polygon Matic"
      ? "polygon_matic_notarization"
      : "test_eth_notarization";

  const getDevoleumStep = async () => {
    let step: IStep = await getData(
      `${import.meta.env.VITE_API_BASE_URL}/api/steps/${itemId()}`
    );
    const jsonContent = await getData(step.uri);

    setHash(await calcHash(JSON.stringify(jsonContent), step.randomizeProof));
    setStep(step);
    await getProof();
  };
  const getProof = async () => {
    const arrayId = await props.contract.hashToId(hash());
    const blockchainStep = await props.contract.stepIdToStepInfo(arrayId);
    await setProof(blockchainStep[1]);
  };

  return (
    <div>
      <div>
        <span class="label">Please insert the Step ID</span>
      </div>
      <input
        class="input"
        type="text"
        onChange={(e: any) => {
          setItemId(e.target.value);
        }}
        value={itemId()}
      />
      <div>
        <button class="button" onClick={() => getDevoleumStep()}>
          Verify Step
        </button>
      </div>
      <span>{error}</span>
      <br />
      <br />
      {proof() && step() && (
        <div>
          <div class="tab-with-corner">
            Devoleum Step{" - "}
            {proof() === hash() ? (
              <span style={{ color: " #44f1a6" }}>Matching</span>
            ) : (
              <span style={{ color: "red" }}>Not Matching</span>
            )}
          </div>
          <div class="boxed">
            <div>
              <span class="label">Step ID: </span>
              {itemId()}
            </div>
            <div>
              <span class="label">Step name: </span>
              <a
                href={"https://app.devoleum.com/step/" + step()._id}
                target="_blank"
                rel="noopener noreferrer"
              >
                {step().name}
              </a>
            </div>
            <div>
              <span class="label">JSON hash: </span>
              {hash}
            </div>
            <div>
              <span class="label">{props.blockchainName} hash: </span>
              {proof}
            </div>
            <div>
              <span class="label">{props.blockchainName} tx: </span>
              <a
                href={step[blockchainNameAttr]}
                target="_blank"
                rel="noopener noreferrer"
              >
                {step[blockchainNameAttr]}
              </a>
            </div>
            <div>
              <span class="label">JSON link: </span>
              <a href={step().uri} target="_blank" rel="noopener noreferrer">
                {step().uri}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verifier;
