import React, { useEffect, useState } from "react";
import { BorrowYourCarContract, web3 , DefaultUserAddress } from "../../utils/contracts";

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:7545'
interface CarInfo {
  owner: string;
  borrower: string;
  borrowUntil: number;
}

const BorrowCars = () => {
  const [account, setAccount] = useState('')

  const [carTokenId, setCarTokenId] = useState("");
  const [toReturnCarTokenId, setToReturnCarTokenId] = useState("");
  const [duration, setDuration] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [result, setResult] = useState("");
  const [availableCars, setAvailableCars] = useState<number[]>([]);
  const [ownedCars, setOwnedCars] = useState<number[]>([]);
  const [showAvailableCars, setShowAvailableCars] = useState(false);
  const [showOwnedCars, setShowOwnedCars] = useState(false);
  const [addressToMint, setAddressToMint] = useState("");
  const [tokenIdToMint, setTokenIdToMint] = useState("");

  const [carTokenIdToQuery, setCarTokenIdToQuery] = useState('');
  const [queriedCarInfo, setQueriedCarInfo] = useState<CarInfo | null>(null);
  const [showQueriedCarInfo, setShowQueriedCarInfo] = useState(false);

  const [timers, setTimers] = useState([]);
  useEffect(() => {
    // 初始化检查用户是否已经连接钱包
    // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
    const initCheckAccounts = async () => {
        // @ts-ignore
        const {ethereum} = window;
        if (Boolean(ethereum && ethereum.isMetaMask)) {
            // 尝试获取连接的用户账户
            const accounts = await web3.eth.getAccounts()
            if(accounts && accounts.length) {
                setAccount(accounts[0])
            }
        }
    }

    initCheckAccounts()
}, [])

const onClickConnectWallet = async () => {
    // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
    // @ts-ignore
    const {ethereum} = window;
    if (!Boolean(ethereum && ethereum.isMetaMask)) {
        alert('MetaMask is not installed!');
        return
    }

    try {
        // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
        if (ethereum.chainId !== GanacheTestChainId) {
            const chain = {
                chainId: GanacheTestChainId, // TODO Chain-ID
                chainName: GanacheTestChainName, // TODO Chain-Name
                rpcUrls: [GanacheTestChainRpcUrl], // TODO RPC-URL
            };

            try {
                // 尝试切换到本地网络
                await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
            } catch (switchError: any) {
                // 如果本地网络没有添加到Metamask中，添加该网络
                if (switchError.code === 4902) {
                    await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                    });
                }
            }
        }

        // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
        await ethereum.request({method: 'eth_requestAccounts'});
        // 获取小狐狸拿到的授权用户列表
        const accounts = await ethereum.request({method: 'eth_accounts'});
        // 如果用户存在，展示其account，否则显示错误信息
        setAccount(accounts[0] || 'Not able to get accounts');
    } catch (error: any) {
        alert(error.message)
    }
}


  const handleBorrowCar = async () => {
    try {
      // 调用 BorrowYourCar 合约的 borrowCar 函数
      setResult(`test1 fetched owned cars. , token: ${account}`);
      await BorrowYourCarContract.methods.borrowCar(carTokenId, duration).send({
        from: account, // 使用当前账户
        // gas: 6721975,
      });
      setResult(`test2 fetched owned cars. , token: ${account}`);
    // 设置定时器，在借用到期后自动调用 returnCar 函数
      setTimeout(async () => {
        try {
          // 在计时器到期后调用 returnCar 函数
          await BorrowYourCarContract.methods.returnCar(carTokenId).send({
            from: account,
            // gas: 6721975,
          });
          setResult(`Successfully returned car ${carTokenId}.`);
        } catch (returnError) {
          if (returnError instanceof Error) {
            setResult(`Error returning car: ${returnError.message}`);
          } else {
            setResult(`Unknown error occurred while returning car.`);
          }
        }
      }, Number(duration) * 1000 + 5000); // 将秒转换为毫秒
      setResult(`Successfully borrowed car ${carTokenId} for ${duration} seconds.`);
    } catch (error) {
        if (error instanceof Error) {
            setResult(`Error: ${error.message}`);
          } else {
            setResult(`Unknown error occurred.`);
          }
    }
  };

  const handleReturnCar = async () => {
    try {
      // 调用 BorrowYourCar 合约的 returnCar 函数
      // const carTokenIdNumeric = parseInt(toReturnCarTokenId); 
      // if (isNaN(carTokenIdNumeric)) {
      //   throw new Error("Invalid carTokenId. It must be a valid number.");
      // }
  
      await BorrowYourCarContract.methods.returnCar(toReturnCarTokenId).send({
        from: account, // 使用当前账户
      });

      setResult(`Successfully returned car ${carTokenId}.`);
    } catch (error ) {
        if (error instanceof Error) {
            setResult(`Error: ${error.message}`);
          } else {
            setResult(`Unknown error occurred.`);
          }
        
    }
  };

  const handlePayRent = async () => {
    try {
      // 调用 BorrowYourCar 合约的 payRent 函数
      await BorrowYourCarContract.methods.payRent(carTokenId, rentAmount).send({
        from: web3.eth.accounts[0], // 使用当前账户
      });

      setResult(`Successfully paid rent for car ${carTokenId}.`);
    } catch (error) {
        if (error instanceof Error) {
            setResult(`Error: ${error.message}`);
          } else {
            setResult(`Unknown error occurred.`);
          }
    }
  };

  const fetchAvailableCars = async () => {
    try {
      // 调用 BorrowYourCar 合约的 getAvailableCars 函数
      const cars = await BorrowYourCarContract.methods.getAvailableCars().call();
      setAvailableCars(cars);
      setShowAvailableCars(true);
    } catch (error) {
      console.error("Error fetching available cars:", error);
    }
    setResult(`Successfully fetched available cars.`);
  };

  const fetchOwnedCars = async () => {
    try {
      // 调用 BorrowYourCar 合约的 getOwnedCars 函数
      // setResult(`test3 fetched owned cars. , token: ${account}`);
      const cars = await BorrowYourCarContract.methods.getOwnedCars().call({
        from: account, // 使用当前账户
      });
      // setResult(`test34 fetched owned cars. , token: ${account}`);
      setOwnedCars(cars);
      setShowOwnedCars(true);
      setResult(`Successfully fetched owned cars.`);
    } catch (error) {
      console.error("Error fetching owned cars:", error);
    }
  }

  const onMintForAccount = async () => {
    try {
      // 根据你的需求更新 tokenId 和地址的获取方式
      const tokenId = parseInt(tokenIdToMint, 10);
      if (isNaN(tokenId) || tokenId <= 0) {
        alert("Please enter a valid tokenId greater than 0.");
        return;
      }

      if (!web3.utils.isAddress(addressToMint)) {
        alert("Please enter a valid Ethereum address.");
        return;
      }

      // 调用合约的 mint 函数
      console.log("Minting token", tokenId, "for address", addressToMint);
      await BorrowYourCarContract.methods.mint(addressToMint, tokenId).send({
        from: DefaultUserAddress, // 使用默认账户发送交易，你可以根据你的需要更改发送者
      });

      setResult(`Successfully minted token ${tokenId} for address ${addressToMint}.`);
    } catch (error) {
      if (error instanceof Error) {
        setResult(`Error: ${error.message}`);
      } else {
        setResult(`Unknown error occurred.`);
      }
    }
  };

  const onQueryCarInfo = async () => {
    try {
      const carInfo = await BorrowYourCarContract.methods.getCarInfo(carTokenIdToQuery).call({
        from: account,
      });
  
      setQueriedCarInfo({
        owner: carInfo[0],
        borrower: carInfo[1],
        borrowUntil: carInfo[2],
      });
  
      setShowQueriedCarInfo(true);
      setResult(`Successfully queried car info for car ${carTokenIdToQuery}.`);
    } catch (error) {
      console.error('Error querying car info:', error);
    }
  };
  return (
    <div>
      <div>
          <h1>Click me to connect wallet: {account}</h1>
          <button onClick={onClickConnectWallet}>Connect Wallet</button>
      </div>
      <div>
        <h2>Result:{result}</h2>
      </div>
      {/* PreMintForSomeAccount */}
      <h1>PreMintForSomeAccount</h1>
      <div>
        <div>Address: </div>
        <input
          value={addressToMint}
          onChange={(e) => setAddressToMint(e.target.value)}
        />
      </div>
      <div>
        <div>Token ID: </div>
        <input
          value={tokenIdToMint}
          onChange={(e) => setTokenIdToMint(e.target.value)}
        />
      </div>
      <div>
        <button onClick={onMintForAccount}>Mint Token</button>
      </div>



      <h1>List available cars</h1>
      <button onClick={fetchAvailableCars}>Show Available Cars</button>
      <button onClick={() => setShowAvailableCars(false)}>Hide Available Cars</button>
      {/* 显示可用车辆列表 */}
      {showAvailableCars && (
        <div>
          <h2>Available Cars:</h2>
          <ul>
            {availableCars.map((carTokenId) => (
              <li key={carTokenId}>{`Car ${carTokenId}`}</li>
            ))}
          </ul>
        </div>
      )}



      <h1>List owned cars</h1>
      <button onClick={fetchOwnedCars}>Show Owned Cars</button>
      <button onClick={() => setShowOwnedCars(false)}>Hide Owned Cars</button>
      {/* 显示可用车辆列表 */}
      {showOwnedCars && (
        <div>
          <h2>Owned Cars:</h2>
          <ul>
            {ownedCars.map((carTokenId) => (
              <li key={carTokenId}>{`Car ${carTokenId}`}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h1> Query Car By Token </h1>
        <div>
          <div>
            <div>Enter Car Token ID: </div>
            <input onChange={(e) => setCarTokenIdToQuery(e.target.value)} />
          </div>
          <button onClick={onQueryCarInfo}>Query Car Info</button>
        </div>

        {showQueriedCarInfo && (
          <div>
            <h3>Queried Car Info</h3>
            <div>Owner: {queriedCarInfo?.owner}</div>
            <div>Borrower: {queriedCarInfo?.borrower}</div>
            <div>Borrow Until: {queriedCarInfo?.borrowUntil}</div>
          </div>
        )}
    </div>


      <h1>Borrow  Car</h1>
      <div>
        <label>Car Token ID:</label>
        <input type="text" value={carTokenId} onChange={(e) => setCarTokenId(e.target.value)} />
      </div>
      <div>
        <label>Duration (seconds):</label>
        <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} />
      </div>
      <button onClick={handleBorrowCar}>Borrow Car</button>




      <h1>Return borrowed car </h1>
      <div>
        <label>Car Token ID:</label>
        <input type="text" value={toReturnCarTokenId} onChange={(e) => setToReturnCarTokenId(e.target.value)} />
      </div>
      <button onClick={handleReturnCar}>Return Car</button>


      {/* <h1> Current Account </h1> */}
      {/* <div> */}
        {/* <label>Current Account: {account} </label> */}
        {/* <input type="text" value={curAccount} onChange={(e) => setCurAccount(e.target.value)} /> */}
      {/* </div> */}
      {/* <h1>Return borrowed car </h1> */}
    </div>
  );
};

export default BorrowCars;