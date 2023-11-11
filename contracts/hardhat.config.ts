import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
const PRIVATE_KEY1 = "08a207716cda1bfa4bda1282beb1bfd8abb6391a640f4d3deff16785cfe07743";
const PRIVATE_KEY2 = "4bfcbcf6d22487699d3256e2f968e40151cdbf003a50f598921fcc9940aa9619";
const PRIVATE_KEY3 = 
"f3573e8e06346b5522c29fc24a25ddd8998a2e1305120f118b3caedfce736328";
const PRIVATE_KEY4 = 
"7adba98be242cbb1c331a510ac6dc21e0ec86e7aeee6bf1325d0036f0374f1e7";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://127.0.0.1:7545',
      // the private key of signers, change it according to your ganache user
      accounts: [`0x${PRIVATE_KEY1}`,`0x${PRIVATE_KEY2}`,`0x${PRIVATE_KEY3}`,`0x${PRIVATE_KEY4}`]
    },
  },
};

export default config;
