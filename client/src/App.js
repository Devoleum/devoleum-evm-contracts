import { h, FunctionalComponent } from "preact";
import { useState, useEffect } from "preact/hooks";
import GetWeb3 from "./GetWeb3";
import Verifier from "./Verifier";
import Notarize from "./Notarize";
import Login from "./Login";
import NotarizeMany from "./NotarizeMany";
import { GetContract } from "./SmartContract";

const App = (props) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setWeb3Task();
    console.log("fired");
    setToken(JSON.parse(localStorage.getItem("userInfo")).token);
  }, []);

  const setWeb3Task = async () => {
    let web3 = await GetWeb3();
    setWeb3(web3);
    setContract(await GetContract(web3));
  };

  const getToken = (text) => {
    setToken(text);
  };
  return (
    <div>
      <div>
        <a
          href="https://devoleum.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Devoleum
        </a>{" "}
        is a{" "}
        <a
          href="https://github.com/Devoleum"
          target="_blank"
          rel="noopener noreferrer"
        >
          open source
        </a>{" "}
        web app that organizes data from physical or digital supply chains into
        authentic stories. Thanks to Devoleum it is possible to notarize the
        steps of a supply chain in an immutable way on blockchains and other
        distributed systems, using cryptographic hashes that allow data
        verification and a high degree of privacy. Each story shows in a clear
        and detailed way the steps that contributed to making the product unique
        and precious. Here you can verify the stories showed on our platform. It's possible to notarize steps if you have the permission.
      </div>
      <br />
      <div>
        In order to make it work you need to have the{" "}
        <a
          href="https://metamask.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Metamask browser extension (Rinkeby network)
        </a>{" "}
        and a CORS enabler extension{" "}
        <a
          href="https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/"
          target="_blank"
          rel="noopener noreferrer"
        >
          like CORS Everywhere
        </a>
        , we will fix that ASAP,         <a
          href="https://github.com/Devoleum/devoleum-eth-notarization-muninn"
          target="_blank"
          rel="noopener noreferrer"
        >feel free to open an issue</a>)
      </div>
      <h2>Verify</h2>
      <Verifier web3={web3} contract={contract} />
      <hr></hr>
      <h2>Notarize</h2>
      <Login changeToken={getToken} />
      {token && contract && (
        <div>
          <Notarize web3={web3} contract={contract} />
          <NotarizeMany web3={web3} contract={contract} />
        </div>
      )}
    </div>
  );
};

export default App;
