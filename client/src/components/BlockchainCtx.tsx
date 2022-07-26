/** @jsxImportSource solid-js */
import { ethers } from "ethers";
import {
  createContext,
  useContext,
  Component,
  ParentComponent,
} from "solid-js";
import { createStore } from "solid-js/store";
import { BlockchainName } from "../models/IStep";

type BlockchainContextValue = [
  { blockchainName: BlockchainName; contract: ethers.Contract },
  {
    changeBcName: (blockchainName: BlockchainName) => void;
    changeContract: (contract: ethers.Contract) => void;
  }
];

const BlockchainContext = createContext<BlockchainContextValue>([
  { blockchainName: "Unknown", contract: {} as ethers.Contract },
  {
    changeBcName: (blockchainName) => {},
    changeContract: (contract) => {},
  },
]);

export const BlockchainProvider: ParentComponent<{
  blockchainName: BlockchainName;
  contract: ethers.Contract;
}> = (props) => {
  const [state, setState] = createStore({
    blockchainName: props.blockchainName || "Unknown",
    contract: props.contract || {},
  });

  const blockchain: BlockchainContextValue = [
    state,
    {
      changeBcName: (blockchainName) => {
        setState({ blockchainName });
        console.log("blockchainName: ", blockchainName);
      },
      changeContract: (contract) => {
        setState({ contract });
      },
    },
  ];

  return (
    <BlockchainContext.Provider value={blockchain}>
      {props.children}
    </BlockchainContext.Provider>
  );
};

export function useBlockhain() {
  return useContext(BlockchainContext);
}
