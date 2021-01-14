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
    setToken(JSON.parse(localStorage.getItem('userInfo')).token);
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
