import logo from 'lib/assets/logo.svg';
import { useWeb3 } from 'lib/web3';
import { Fragment, useEffect, useCallback, useState } from 'react';
import { Wallet } from 'components';
import Link from 'next/link';

export function Header() {
  const { account, connect, checkConnection, disconnect, getBalance, getAccount } = useWeb3();
  const [balance, setBalance] = useState(null);
  const [accountAddr, setAccountAddr] = useState("");

  const checkIfConnected = useCallback(async () => {
    await checkConnection()
  }, []);

  const getAccountData = useCallback(async () => {
    if (account !== null) {
      setAccountAddr(account)
      const balance = await getBalance();
      setBalance(balance)
    }
  }, [account])

  function logout() {
    setAccountAddr("");
    setBalance(null);
    disconnect();
  }

  useEffect(() => {
    if (account !== null || account !== accountAddr && balance === null) {
      getAccountData();
    }


  }, [checkIfConnected, account, getAccountData])

  return (
    <div className="bg-gray-900 border-b border-gray-800 text-white text-sm font-mono">
      <div className="container py-4 md:flex items-center">
        <div className="flex-1 mb-3 md:mb-0">
          <a href="/">
            <img src={logo.src} className={"filter"} style={{ height: 22 }} />
            <h6>justArt Market</h6>
          </a>
        </div>
        <div className="flex space-x-6 items-center">
          {accountAddr ? (
            <Fragment>
              <Link href="/create">
                <a>Create</a>
              </Link>
              <Link href="/my-items">
                <a>My Items</a>
              </Link>
              <Wallet
                address={accountAddr}
                amount={balance}
                symbol="cUSD"
                destroy={logout}
              />
            </Fragment>
          ) : (
            <a onClick={connect} className="border border-red-500 px-3 py-2">Connect Wallet</a>
          )}
        </div>
      </div>
    </div>
  )
}