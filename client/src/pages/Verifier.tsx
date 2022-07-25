/** @jsxImportSource solid-js */
import { keccak } from "hash-wasm";
import { useParams } from "solid-app-router";
import { Component, createSignal } from "solid-js";
import { IStep } from "../models/IStep";

interface IProps {
  blockchainName: string;
}

const Verifier: Component<IProps> = (props: IProps) => {
  let { id = "" } = useParams();
  console.log(id);

  const [step, setStep] = createSignal<IStep>();
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
      `${process.env.VITE_API_BASE_URL}/api/steps/${itemId()}`
    );
    const jsonContent = await getData(step.uri);
    setHash(await calcHash(JSON.stringify(jsonContent), step.randomizeProof));
    setStep(step);
    await getProof(hash);
  };
  const getProof = async (hashJson) => {
    const arrayId = await props.contract.methods.hashToId(hashJson).call();

    const blockchainStep = await props.contract.methods
      .stepIdToStepInfo(arrayId)
      .call();

    console.log(blockchainStep);
    await setProof(blockchainStep[1]);
  };

  const outcomeComparison = (success: boolean) => {
    success ? (
      <div style={{ color: "green" }}>Success, exact match!</div>
    ) : (
      <div style={{ color: "red" }}>Epic fail, are not the same!</div>
    );
  };

  const getData = async (url: string) => {
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

  const calcHash = async (content: string, random: string) => {
    const hash = await keccak(content + random, 256);
    return hash;
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
      {proof() && step() &&(
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
                {step.id}
              </div>
              <div>
                <span class="label">Step name: </span>
                <a
                  href={"https://app.devoleum.com/step/" + step._id}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {step.name}
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
