import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async() => {
    if (atm) {
      let amount = prompt("Enter Amount");

      let tx = await atm.deposit(parseInt(amount));
      await tx.wait()
      localStorage.setItem("lastTransaction",amount);
      localStorage.setItem("transactionType","deposit");
      getBalance();
    }
  }

  const withdraw = async() => {
    if (atm) {
      let amount = prompt("Enter Amount");
      let tx = await atm.withdraw(parseInt(amount));
      await tx.wait()
      localStorage.setItem("lastTransaction",amount);
      localStorage.setItem("transactionType","withdraw");
      getBalance();
    }
  }

  const revert = async() => {
    if (atm) {
      var confimation = prompt("Do You want to revert the last transaction of "+localStorage.getItem("lastTransaction")+" ?");
      let tx;
      if(confimation == "y" || confimation == "Y" || confimation == "yes" || confimation == "Yes" ){
        if(localStorage.getItem("transactionType") == "deposit"){
          tx = await atm.withdraw(parseInt(localStorage.getItem("lastTransaction")));
        }
        else{
            tx = await atm.deposit(parseInt(localStorage.getItem("lastTransaction")));
        }
        await tx.wait()
        getBalance()
      }
      else{
        alert("Confirmation Cancelled!");
      }
      // let amount = prompt("Enter Amount");
      ;
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Current Account: {account}</p>
        <p>Balance: {balance}</p>
        <button onClick={deposit}>Deposit</button>
        <button onClick={withdraw}>Withdraw</button>
        <button onClick={revert}>Revert</button>
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>AyushMANdolin</h1></header>
      {initUser()}
      <style jsx>{`
      h1{
        font-size:45px;
        ;
      }
        .container {
          background-color:pink;
          text-align: center; 
        }
        h1{
          font-family: Snap ITC;
        }
      `}
      </style>
    </main>
  )
}
