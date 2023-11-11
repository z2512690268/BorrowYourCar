import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

// 在测试中增加时间
async function increaseTime(seconds : number) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

// 获取测试时间
async function getBlockTime() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}

describe("BorrowYourCar", function () {
  it("Should deploy and retrieve information about the contract", async function () {
    const BorrowYourCar = await ethers.getContractFactory("BorrowYourCar");
    const borrowYourCar = await BorrowYourCar.deploy("0x5F4231c6b543e008BAcc9F09593Eba18Ba57ab72");
    await borrowYourCar.deployed();

    expect(await borrowYourCar.name()).to.equal("ZKY");
    expect(await borrowYourCar.symbol()).to.equal("SYM1");
  });

  it("Should return the list of available cars", async function () {
    let borrower1, borrower2, borrower3, borrower4;
    const BorrowYourCar = await ethers.getContractFactory("BorrowYourCar");
    [borrower1, borrower2, borrower3, borrower4] = await ethers.getSigners();
    const borrowYourCar = await BorrowYourCar.deploy("ZKY", "SYM1", "0x5F4231c6b543e008BAcc9F09593Eba18Ba57ab72");
    await borrowYourCar.deployed();

    for (let i = 0; i < 3; i++) {
      borrowYourCar.mint(borrower1.address, i);
    }
    for (let i = 3; i <= 5; i++) {
      borrowYourCar.mint(borrower2.address, i);
    }
  
    // 预期在合约部署时，有一些车辆是可用的
    const initialAvailableCars = await borrowYourCar.getAvailableCars();
    console.log(initialAvailableCars);

    expect(initialAvailableCars).to.have.lengthOf(6);
  
    // 在这里执行其他操作，例如借用一些车辆，然后再次验证可用车辆列表
  
    // 假设所有车辆都被借用，再次调用 getAvailableCars 应该返回一个空数组
    // 这取决于你的合约逻辑和测试场景
    // 以下是一个示例，具体根据你的合约行为来调整
    for (let i = 0; i < 4; i++) {
      // 假设每辆车都被借用
      await borrowYourCar.connect(borrower3).borrowCar(initialAvailableCars[i], 10 + 20 * i); // 假设借用一小时
    }

    const finalAvailableCars = await borrowYourCar.getAvailableCars();
    expect(finalAvailableCars).to.have.lengthOf(2);
    console.log(finalAvailableCars);
    
    console.log("current time: ", await getBlockTime());

    await borrowYourCar.connect(borrower3).returnCar(0);
    await borrowYourCar.connect(borrower3).returnCar(1);


    // await increaseTime(40);
    // console.log("current time: ", await getBlockTime());

    const finalAvailableCars2 = await borrowYourCar.getAvailableCars();
    expect(finalAvailableCars2).to.have.lengthOf(4);
    console.log(finalAvailableCars2);


    // console.log("owned cars: ", await borrowYourCar.connect(borrower1).getOwnedCars());
    console.log("total cars: ", await borrowYourCar.totalSupply());

    for (let i = 0; i <= 5; i++) {
      console.log("cars ", i, " : ", await borrowYourCar.cars(i));
    }
  });

  // it("pay ERC20 for rent cars", async function () {
  //   const ERC20 = await ethers.getContractFactory("ERC20Token");
  //   const erc20 = await ERC20.deploy("ZKY", "SYM1");
  //   await erc20.deployed();



  //   let borrower1, borrower2, borrower3, borrower4;

  //   const BorrowYourCar = await ethers.getContractFactory("BorrowYourCar");
  //   [borrower1, borrower2, borrower3, borrower4] = await ethers.getSigners();
  //   const borrowYourCar = await BorrowYourCar.deploy("ZKY", "SYM1", erc20.address);
  //   await borrowYourCar.deployed();



  // });
});
