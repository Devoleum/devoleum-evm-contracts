import contractJSON from './contracts/Devoleum.json'

const GetContract = async (web3) => {
  const netId = await web3.eth.net.getId();
  const deployedNetwork = contractJSON.networks[netId];
  const contract = new web3.eth.Contract(
    contractJSON.abi,
    deployedNetwork && deployedNetwork.address
  );
  return contract;
};


export {
  GetContract
}