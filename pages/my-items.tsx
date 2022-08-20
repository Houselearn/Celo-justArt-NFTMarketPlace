import React, { useState, useCallback, useEffect } from "react";
import { Layout, Loader } from "components";
import { ItemList } from "components/item-list/item-list";
import { getUserItemsArray, getItemFromID } from "lib/market";
import { useWeb3 } from "lib/web3";
import { useMarketContract } from "lib/contracts";
import { Item } from "lib/interfaces";

function MyListings() {
  const [items, setItems] = useState<Item[]>(null);
  const [loading, setLoading] = useState(false);

  const { account } = useWeb3();
  const contract = useMarketContract();

  // function to get the list of items
  const retrieveItems = useCallback(async () => {
    if (contract === null && account === null) {
      return
    }
    try {
      setLoading(true);
      const userItemsIds = await getUserItemsArray(account, contract);
      const userItemsArr: Item[] = [];
      for (let i = 0; i < userItemsIds.length; i++) {
        const item = await getItemFromID(userItemsIds[i], contract);
        userItemsArr.push(item);
      }
      setItems(userItemsArr);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    if (items === null) {
      retrieveItems();
    }
  }, [retrieveItems, account])

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-semibold text-xl mb-5">My Items</h1>
        {loading && <Loader />}
        <ItemList items={items} />
      </div>
    </Layout>
  )
}

export default MyListings;