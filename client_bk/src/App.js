import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import GetWeb3 from "./GetWeb3";
import Verifier from "./Verifier";
import { GetContract } from "./SmartContract";
import Header from "./Header";
import Notarize from "./Notarizer";

const App = (props) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [blockchainName, setBlockchainName] = useState("Unknown");
  const [token, setToken] = useState(null);

  useEffect(() => {
    setWeb3Task();
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      })
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })
    }
  }, []);

  const setWeb3Task = async () => {
    let web3 = await GetWeb3();
    setWeb3(web3);
    web3.eth.net.getId().then((netId) => {
      switch (netId) {
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
          console.log("This is an unknown network. id: ", netId);
          setBlockchainName("Unkown");
      }
    });
    setContract(await GetContract(web3));
  };

  const getToken = (text) => {
    setToken(text);
  };
  return (
    <div className="container">
      <h1 className="title">Devoleum - {blockchainName} Verifier</h1>
      {(blockchainName === "Polygon Matic" ||
        blockchainName === "Ethereum Rinkeby") ? (
        <Router>
          <nav>
            <Link to="/">Verifier</Link> |{" "}
            <Link to="/notarizer">Notarizer</Link>
          </nav>
          <Header blockchainName={blockchainName} />
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
          <Switch>
            <Route path="/notarizer">
              <Notarize web3={web3} contract={contract} blockchainName={blockchainName}/>
            </Route>
            <Route path="/:id?">
              <Verifier web3={web3} contract={contract} blockchainName={blockchainName}/>
            </Route>
            <Route>
              <h2 className="title">404 not found</h2>
            </Route>
          </Switch>
        </Router>
      ) : <div> Please change Metamask network to Polygon Matic or Rinkeby and refresh the page</div>}
    </div>
  );
};

export default App;
