import { v4 as uuid4 } from "uuid";
import { Item } from "lib/interfaces";
import BigNumber from "bignumber.js"
import { ERC20_DECIMALS, MARKET_ADDRESS } from "./constants";
import { Contract } from "web3-eth-contract"

export async function addNewItem(item: Item, marketContract: Contract, account: string) {
    item.id = uuid4();
    item.price = new BigNumber(item.price)
        .shiftedBy(ERC20_DECIMALS)
        .toString();

    await marketContract.methods.addNewItem(
        item.id,
        item.name,
        item.description,
        item.image,
        item.location,
        item.price
    ).send({
        from: account
    });
    return item.id;
}

export async function buyItem({ itemId }, marketContract: Contract, account: string) {
    return await marketContract.methods.buyItems(itemId).send({
        from: account
    })
}

export async function approve({ amount }, erc20: Contract, account) {
    return await erc20.methods.approve(MARKET_ADDRESS, amount).send({
        from: account
    })
}

export function relistItem(itemId: string, newPrice: string, newLocation: string, marketContract: Contract, account: string) {
    newPrice = new BigNumber(newPrice)
        .shiftedBy(ERC20_DECIMALS)
        .toString();
    return marketContract.methods.relistItem(itemId, newLocation, newPrice).send({
        from: account
    });
}

export function unlistItem(itemId: string, marketContract: Contract, account: string) {
    return marketContract.methods.unlistItem(itemId).send({
        from: account
    });
}

export function getUserItemsArray(account: string, marketContract: Contract) {
    return marketContract.methods.getUserItems(account).call();
}

export function getItemFromID(itemId: string, marketContract: Contract) {
    return marketContract.methods.getItemFromID(itemId).call();
}

export function getItemCounts(marketContract: Contract) {
    return marketContract.methods.getItemCounts().call();
}

export function getItemFromCountMap(count: number, marketContract: Contract) {
    return marketContract.methods.getItemFromCountMap(count).call()
}

export async function getItems(marketContract: Contract) {
    const _itemsLength = await getItemCounts(marketContract);
    const _items = []
    for (let i = 0; i < _itemsLength; i++) {
        let _item = new Promise(async (resolve, reject) => {
            let p = await getItemFromCountMap(i, marketContract)
            resolve(p)
        })
        _items.push(_item)
    }
    const items = await Promise.all(_items);
    return items;
}