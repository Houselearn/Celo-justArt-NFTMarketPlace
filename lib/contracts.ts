import { MARKET_ADDRESS, cUSD_ADDRESS } from './constants';
import { useWeb3 } from "./web3";
import { newKitFromWeb3 } from '@celo/contractkit'
import marketAbi from './abis/justArtMarket.abi.json';
import erc20Abi from './abis/IERC20.abi.json';

export function useMarketContract() {
  const { web3 } = useWeb3();

  const kit = newKitFromWeb3(web3);

  return new kit.web3.eth.Contract(marketAbi as any, MARKET_ADDRESS);
}

export function useERC20Contract() {
  const { web3 } = useWeb3();

  const kit = newKitFromWeb3(web3);

  return new kit.web3.eth.Contract(erc20Abi as any, cUSD_ADDRESS);
}