// Enum of contract function signatures our dialogs should support
// https://www.4byte.directory/signatures/

// values can be generated with functionSignature('approve(address,uint256)')

export enum TransactionType {
  SEND_COIN = '0x', // empty tx data
  APPROVE_TOKEN = '0x095ea7b3', // approve(address,uint256)
  TRANSFER_TOKEN = '0xa9059cbb', // transfer(address,uint256)
  VESTING_WITHDRAW_TOKENS = '0x49df728c', // withdrawTokens(address)
  WRBTC_PROXY_SWAP = '0xb37a4831', // convertByPath(address[],uint256,uint256)
  SWAP_NETWORK_SWAP = '0xb77d239b', // convertByPath(address[],uint256,uint256,address,address,uint256)
  LENDING_DEPOSIT_NATIVE = '0xfb5f83df', // mintWithBTC(address,bool)
  LENDING_WITHDRAW_NATIVE = '0x0506af04', // burnToBTC(address,uint256,bool)
  LENDING_DEPOSIT = '0xd1a1beb4', // mint(address,uint256,bool)
  LENDING_WITHDRAW = '0x76fd4fdf', // burn(address,uint256,bool)
  ADD_LIQUIDITY_TO_V1 = '0x60dc20cd', // addLiquidityToV1(address,address[],uint256[],uint256)
  ADD_LIQUIDITY_TO_V2 = '0xe90988e8', // addLiquidityToV2(address,address,uint256,uint256)
  REMOVE_LIQUIDITY_FROM_V1 = '0xe94190ed', // removeLiquidityFromV1(address,uint256,address[],uint256[])
  REMOVE_LIQUIDITY_FROM_V2 = '0x0ec9e443', // removeLiquidityFromV2(address,address,uint256,uint256)
  UNKNOWN = 'unknown',
}
