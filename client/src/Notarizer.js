import React from "react";
import Login from "./Login";
import NotarizeMany from "./NotarizeMany";

const Notarizer = ({web3, contract}) => {


  return (
    <div>
      <h2 className="sub-title">Notarizer</h2>
        <div>
          <Login />
          <NotarizeMany web3={web3} contract={contract} />
        </div>
    </div>
  );
};

export default Notarizer;
