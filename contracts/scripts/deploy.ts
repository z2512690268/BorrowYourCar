import { ethers } from "hardhat";
import { int } from "hardhat/internal/core/params/argumentTypes";

async function main() {
  const BorrowYourCar = await ethers.getContractFactory("BorrowYourCar");
  const borrowYourCar = await BorrowYourCar.deploy("0x5F4231c6b543e008BAcc9F09593Eba18Ba57ab72");
  
  await borrowYourCar.deployed();

  console.log(`BorrowYourCar deployed to ${borrowYourCar.address}`);
  const ABI = borrowYourCar.interface.format("json");
  // write to file
  // const fs = require('fs');
  // fs.writeFileSync('D:/MyE/ZJU/blockchain/ZJU-blockchain-course-2023/frontend/src/utils/abis/ABI.json', ABI);
  console.log(`name: ${await borrowYourCar.name()}`);
  console.log(`symbol: ${await borrowYourCar.symbol()}`);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});