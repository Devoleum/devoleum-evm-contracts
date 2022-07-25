import { ethers } from "ethers";

export interface IPageProps {
  blockchainName: string;
  contract: ethers.Contract;
}
