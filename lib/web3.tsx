import { createContext, useContext, useState } from "react";
import Web3 from 'web3';
import { newKitFromWeb3 } from '@celo/contractkit'
import Web3Modal from 'web3modal';
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import canUseDom from 'can-use-dom';
import BigNumber from 'bignumber.js';

const Web3Context = createContext<{ account: string, web3: Web3, connect: () => Promise<void>, checkConnection: () => Promise<void>, disconnect: () => Promise<void>, getBalance: () => Promise<BigNumber>, getAccount: () => Promise<string> }>(null);

const web3Modal = canUseDom && new Web3Modal({
  network: 'Celo Alfajores Testnet',
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          44787: 'https://alfajores-forno.celo-testnet.org'
        },
        chainId: 44787,
        bridge: 'https://bridge.walletconnect.org',
        qrcode: true
      }
    }
  }
});

function defaultWeb3() {
  return new Web3('https://alfajores-forno.celo-testnet.org');
}

function Web3Provider({ children }) {
  const [account, setAccount] = useState<string>(null);
  const [web3, setWeb3] = useState<Web3>(defaultWeb3());

  async function handleConnect() {
    const provider = await web3Modal.connect();
    const web3 = new Web3(provider);
    setWeb3(web3);

    const kit = newKitFromWeb3(web3);

    setAccount((await kit.web3.eth.getAccounts())[0].toLowerCase());

    provider.on("accountsChanged", (accounts) => {
      setAccount(accounts[0].toLowerCase());
    });

    // provider.on("disconnect", () => {
    //   setAccount(null);
    // });
  }

  async function getAccount() {
    return account;
  }

  async function checkIfConnected() {
    // @ts-ignore
    const { ethereum } = window;

    const check = await ethereum._metamask.isUnlocked();

    if (check) {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } else {
      setAccount(null);
    }
  }

  async function getBalance() {

    const kit = newKitFromWeb3(web3);
    const balance = await kit.getTotalBalance(account);

    return balance.cUSD;
  }

  async function disconnect() {
    setAccount(null);
  }

  return (
    <Web3Context.Provider value={{ account, web3, connect: handleConnect, checkConnection: checkIfConnected, disconnect, getBalance, getAccount }}>
      {children}
    </Web3Context.Provider>
  )
}

function useWeb3() {
  return useContext(Web3Context)
}

export { Web3Context, Web3Provider, useWeb3 };