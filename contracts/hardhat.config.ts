import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // Use a local Ganache instance with unlocked development accounts.
      url: "http://127.0.0.1:7545",
      // Ganache manages the accounts and signs transactions; no private keys here.
      accounts: "remote",
    },
  },
};

export default config;
