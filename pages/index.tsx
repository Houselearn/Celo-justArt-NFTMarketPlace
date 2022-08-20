import React, { useCallback, useEffect, useState } from "react";
import { Layout, Loader } from "components";
import { ItemList } from "components/item-list/item-list";
import { Item } from "lib/interfaces";
import { getItems } from "../lib/market";
import { useMarketContract } from "lib/contracts";
import { useWeb3 } from "lib/web3";

function Index() {
  const { account } = useWeb3();
  const [items, setItems] = useState<Item[]>(null);
  const [loading, setLoading] = useState(false);

  const contract = useMarketContract();

  // function to get the list of items
  const retrieveItems = useCallback(async () => {
    if (contract === null) {
      return
    }
    try {
      setLoading(true);
      let listedItems: Item[] = []
      const items: Item[] = await getItems(contract);
      for (let i = 0; i < items.length; i++) {
        if (!items[i].isItemListed) {
          continue;
        }
        listedItems.push(items[i])
      }
      setItems(listedItems);
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
  }, [retrieveItems, account, items])

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-semibold text-xl mb-5">Listed Items</h1>
        {loading && <Loader />}
        <ItemList items={items} />
      </div>
    </Layout>
  )
}

export default Index;