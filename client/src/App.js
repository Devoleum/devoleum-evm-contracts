import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import GetWeb3 from "./GetWeb3";
import Verifier from "./Verifier";
import { GetContract } from "./SmartContract";
import Header from "./Header";
import Notarize from "./Notarize";

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
    <div className="container">
      <h1 className="title">Devoleum - Ethereum Verifier</h1>
      <Router>
        <nav>
          <Link to="/">Verifier</Link> | <Link to="/notarizer">Notarizer</Link>
        </nav>
        <Header />
        <div>
          In order to make it work you need to have the{" "}
          <a
            href="https://metamask.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Metamask browser extension (Rinkeby network).
          </a>
        </div>
        <br />
        <Switch>
          <Route path="/notarizer">
            <Notarize />
          </Route>
          <Route path="/:id?">
            <Verifier web3={web3} contract={contract} />
          </Route>
          <Route>
            <h2 className="title">404 not found</h2>
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
