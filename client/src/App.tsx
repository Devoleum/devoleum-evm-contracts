/** @jsxImportSource solid-js */
import {
  Link,
  Route,
  RouteDefinition,
  Router,
  Routes,
  useRoutes,
} from "solid-app-router";
import { Component, createEffect, createSignal, lazy, onMount } from "solid-js";
import { Header } from "./components/Header";
import { ethers } from "ethers";
import "./styles/index.css";
import "./styles/responsive.css";
import DevoleumArtifact from "../../artifacts/src/Devoleum.sol/Devoleum.json";
import { BlockchainProvider, useBlockhain } from "./components/BlockchainCtx";
import Verifier from "./pages/Verifier";
import NotarizeMany from "./pages/NotarizeMany";
console.log(import.meta.env.VITE_API_BASE_URL);

const App: Component = () => {
  const [blockchainName, setBlockchainName] = createSignal("Unkown");
  const [contract, setContract] = createSignal<ethers.Contract>(
    {} as ethers.Contract
  );

  const routes: RouteDefinition[] = [
    {
      path: "/:id?",
      component: (
        <Verifier blockchainName={blockchainName()} contract={contract()} />
      ) as Component,
    },
    {
      path: "/notarizer",
      component: (
        <NotarizeMany blockchainName={blockchainName()} contract={contract()} />
      ) as Component,
    },
  ];
  const Routes = useRoutes(routes);
  onMount(async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const { chainId } = await provider.getNetwork();
    chainIdSwitch(chainId);
    const signer = provider.getSigner();
    const contractTemp = new ethers.Contract(
      blockchainName() === "Polygon Matic"
        ? "0x2ac0ccfbdcff7d1dd88f5b6fa7b0354adfbe4378"
        : "0x64169a158089f879048738e944c5c930548c620f",
      DevoleumArtifact.abi,
      provider
    );

    setContract(contractTemp);
  });

  const chainIdSwitch = (chainId: number) => {
    switch (chainId) {
      case 1:
        console.log("This is mainnet");
        break;
      case 4:
        console.log("This is Rinkeby test network.");
        setBlockchainName("Ethereum Rinkeby");
        break;
      case 137:
        console.log("This is the ropsten test network.");
        setBlockchainName("Polygon Matic");
        break;
      default:
        console.log("This is an unknown network. id: ", chainId);
        setBlockchainName("Unknown");
    }
  };

  // There is only ever up to one account in MetaMask exposed
  return (
    <BlockchainProvider
      blockchainName={"Unknown"}
      contract={{} as ethers.Contract}
    >
      <div class="container App">
        <h1 class="title">Devoleum - {blockchainName()} Verifier</h1>
        {window.ethereum ? (
          <>
            <nav>
              <Link href="/">Verifier</Link> |{" "}
              <Link href="/notarizer">Notarizer</Link>
            </nav>
            <Header blockchainName={blockchainName()} />
            <div>
              In order to make it work you need to have the{" "}
              <a
                href="https://metamask.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Metamask browser extension.
              </a>
            </div>
            <br />
            <Routes />
          </>
        ) : (
          <div>
            {" "}
            Please change Metamask network to Polygon Matic or Rinkeby and
            refresh the page
          </div>
        )}
      </div>
    </BlockchainProvider>
  );
};

export default App;
