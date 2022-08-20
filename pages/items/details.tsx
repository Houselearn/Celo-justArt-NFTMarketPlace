import { Button, Layout, Loader } from "components";
import { getItemFromID } from "lib/market";
import TimeAgo from "react-timeago";
import { ExternalLink } from "react-feather";
import { useWeb3 } from "lib/web3";
import { unlistItem, buyItem, approve } from "lib/market";
import { useMarketContract, useERC20Contract } from "lib/contracts";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { Item } from "lib/interfaces";
import { formatBigNumber, truncateAddress, typeformat } from "lib/utils";
import ListItemModal from "./listModal";
import BigNumber from "bignumber.js";
import { MARKET_ADDRESS } from "lib/constants"
import { toast } from "react-toastify";

function Details({ id }: { id: string }) {

  const template: Item = {
    id: "...",
    owner: "...",
    name: "...",
    description: "...",
    image: "...",
    location: "...",
    price: "0",
    isItemListed: true,
    history: []
  }

  const { account, connect } = useWeb3();
  const marketContract = useMarketContract();
  const erc20 = useERC20Contract();
  const [item, setItem] = useState<Item>(template);
  const [loading, setLoading] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [approved, setApproved] = useState<boolean>(null);

  const handleClose = () => setShowModal(false);

  const checkIfContractIsApprovedToSpend = useCallback(async () => {
    if (approved === null && item.price !== "0" && account !== null) {
      const result = await erc20.methods.allowance(account, MARKET_ADDRESS).call();
      setApproved(result >= item.price);
    } else {
      return
    }
  }, [account, item])

  const getItemData = useCallback(async () => {
    if (marketContract !== null || account !== null || id !== null) {
      try {
        setPageLoad(true);
        setItem(await getItemFromID(id, marketContract));
      } catch (error) {
        console.log({ error });
      } finally {
        setPageLoad(false);
      }
    }
  }, [marketContract, account, id]);

  const buttonLabel = account ? (item.owner.toLocaleLowerCase() === account.toLocaleLowerCase() ? (item.isItemListed ? 'Remove listing' : 'Add listing') : (approved ? 'Buy now' : 'Approve')) : 'Connect Wallet';

  async function handleAction() {
    if (marketContract === null) {
      console.log(marketContract)
      return
    }
    if (account === null) {
      await connect();
      return;
    }
    setLoading(true);
    try {
      if (item.owner.toLocaleLowerCase() === account.toLocaleLowerCase()) {
        if (buttonLabel == "Add listing") {
          setShowModal(true);
        } else if (buttonLabel == "Remove listing") {
          await unlistItem(item.id, marketContract, account);
          getItemData();
        }
      } else {
        if (!approved) {
          try {
            await approve({ amount: item.price }, erc20, account);
            setApproved(true);
            toast.success('Contract Approved');
          } catch (e) {
            toast.error('Approve contract to complete purchase')
          }
        } else {
          await buyItem({ itemId: item.id }, marketContract, account);
          getItemData();
        }
      }
    } catch (e) {
      console.log(e)
    }
    setLoading(false);

  }

  useEffect(() => {
    if (id === null) {
      return () => { }
    }
    if (item.price === "0") {
      getItemData();
    }
    checkIfContractIsApprovedToSpend();

  }, [id, getItemData, checkIfContractIsApprovedToSpend, account])
  return (
    <Layout>
      {pageLoad ? (
        <Loader />
      ) : (
        <div className="container py-8">
          <div className="md:grid md:grid-cols-3 md:gap-8">
            <div className="mb-8 md:mb-0">
              <div className="bg-gray-800 border border-gray-800 mb-8">
                <img src={item.image} className="w-full rounded-sm shadow-xl" />
              </div>
              {Number(formatBigNumber(new BigNumber(item.price))) > 0 && (
                <Fragment>
                  <div className="bg-gray-800 border border-gray-700 rounded-sm grid grid-cols-2 divide-x divide-gray-700">
                    <div className="p-4 text-center">
                      <p className="uppercase font-bold text-sm mb-1 text-red-600">
                        Item Price
                      </p>
                      <p className="font-mono text-xl leading-none">
                        {formatBigNumber(new BigNumber(item.price))} cUSD
                      </p>
                    </div>
                    <div className="p-3 flex flex-col justify-center items-center">
                      <Button onClick={handleAction} loading={loading} block>{buttonLabel}</Button>
                    </div>
                  </div>
                </Fragment>
              )}
            </div>
            <div className="md:col-span-2">
              <div className="bg-gray-800s lg:border-l border-gray-700 border-dashesd lg:pl-8 rounded-sm">
                <p className="text-lg font-medium">
                  <a>{item.name}</a>
                </p>
                <h1 className="text-4xl font-bold">{item.name}</h1>
                <p className="mb-8 w-full">
                  <span className="mr-1">Owned by</span>
                  <a
                    href={`https://alfajores-blockscout.celo-testnet.org/address/${item.owner}/transactions`}
                    target="_blank"
                    className="font-mono text-red-200 border-b border-dashed border-gray-700 truncate block">
                    {truncateAddress(item.owner)}
                  </a>
                </p>
                <h3 className="mb-3 font-semibold text-lg">Details</h3>
                <div className="mb-8 bg-gray-900 p-4 rounded-sm space-y-4">
                  <div>
                    <span className="font-bold text-sm block">Description</span>
                    {item.description}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Location</span>
                    {item.location}
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <span className="font-bold text-sm block">Item ID</span>
                      {item.id}
                    </div>
                  </div>
                </div>
                <h3 className="mb-3 font-semibold text-lg">History</h3>
                <div className="bg-gray-900 rounded-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <td className="px-4 py-3">Type</td>
                        <td className="px-4 py-3">From</td>
                        <td className="text-right px-4 py-3">Price</td>
                        <td className="text-right px-4 py-3">Time</td>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {item.history.map(transaction => (
                        <tr key={transaction.id}>
                          <td className="border-t border-gray-800 px-4 py-3">
                            <span className="flex items-center space-x-1" style={{ "color": "#D7342A" }}>
                              <span>{typeformat(Number(transaction.tranType))}</span>
                              <ExternalLink size="0.85em" />
                            </span>
                          </td>
                          <td className="relative w-1/4 border-t border-gray-800">
                            <span className="absolute inset-0 truncate px-4 py-3">
                              {truncateAddress(transaction.from)}
                            </span>
                          </td>
                          <td className="relative w-1/4 border-t border-gray-800 px-4 py-3 text-right">
                            {Number(transaction.price) ? `${formatBigNumber(new BigNumber(transaction.price))} cUSD` : '--'}
                          </td>
                          <td className="text-right border-t border-gray-800 px-4 py-3">
                            <TimeAgo date={new Date(transaction.createdAt * 1000)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal ? (
        <ListItemModal handleClose={handleClose} update={getItemData} marketContract={marketContract} id={item.id} />
      ) :
        <></>
      }

    </Layout>
  )
}

export default Details;