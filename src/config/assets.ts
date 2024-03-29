import { constants } from 'ethers';
import { Asset, AssetType } from 'models/asset';

function checkAssets<S extends string>(arr: (Asset & { id: S })[]) {
  return arr;
}

export const assets = checkAssets([
  // rsk mainnet
  new Asset(
    30,
    'rbtc',
    'RBTC',
    'Smart Bitcoin',
    constants.AddressZero,
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/rbtc.svg',
    'Native Coin of RSK network.',
    AssetType.NATIVE,
  ),
  new Asset(
    1,
    'eth',
    'ETH',
    'Ethereum',
    constants.AddressZero,
    18,
    'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'Native Coin of Ethereum network.',
    AssetType.NATIVE,
  ),
  new Asset(
    56,
    'bnb',
    'BNB',
    'Binance Coin',
    constants.AddressZero,
    18,
    'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
    'Native Coin of Binance Smart Chain network.',
    AssetType.NATIVE,
  ),
  new Asset(
    30,
    'sov',
    'SOV',
    'Sovryn',
    '0xEFc78fc7d48b64958315949279Ba181c2114ABBd',
    18,
    require('assets/tokens/sov.png'),
    'Native ERC20 for Sovryn Protocol.',
    AssetType.ERC20,
  ),
  new Asset(
    1,
    'esov',
    'eSOV',
    'Sovryn on Ethereum',
    '0xbdab72602e9ad40fc6a6852caf43258113b8f7a5',
    18,
    require('assets/tokens/sov.png'),
    'SOV token bridged to Ethereum network. Can be bridged back to SOV 1:1.',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'xusd',
    'XUSD',
    'XUSD',
    '0xb5999795BE0EbB5bAb23144AA5FD6A02D080299F',
    18,
    require('assets/tokens/xusd.png'),
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'dllr',
    'DLLR',
    'DLLR',
    '0xc1411567D2670E24D9c4Daaa7CdA95686E1250Aa',
    18,
    require('assets/tokens/dllr.png'),
    'Sovryn Dollar',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'zusd',
    'ZUSD',
    'ZUSD',
    '0xdB107FA69E33f05180a4C2cE9c2E7CB481645C2d',
    18,
    require('assets/tokens/zusd.png'),
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc',
    'wRBTC',
    'Wrapped Smart Bitcoin',
    '0x542fDA317318eBF1d3DEAf76E0b632741A7e677d',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/rbtc.svg',
    'RBTC wrapped to ERC20 token. Can be unwrapped to RBTC 1:1.',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'bpro',
    'BPRO',
    'BPRO',
    '0x440cd83c160de5c96ddb20246815ea44c7abbca8',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/bpro.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'rif',
    'RIF',
    'RIF',
    '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/rif.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'rusdt',
    'RUSDT',
    'RUSDT',
    '0xEf213441a85DF4d7acBdAe0Cf78004E1e486BB96',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/usdt.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'eths',
    'ETHS',
    'Ethereum on Sovryn',
    '0x1D931Bf8656d795E50eF6D639562C5bD8Ac2B78f',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/eth.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'bnbs',
    'BNBS',
    'Binance Coin on Sovryn',
    '0x6D9659bdF5b1A1dA217f7BbAf7dBAF8190E2e71B',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/bnb.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'fish',
    'FISH',
    'BabelFish',
    '0x055A902303746382FBB7D18f6aE0df56eFDc5213',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/babelfish.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'mynt',
    'MYNT',
    'Mynt',
    '0x2e6B1d146064613E8f521Eb3c6e65070af964EbB',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/mint.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'doc',
    'DOC',
    'Dollar On Chain',
    '0xe700691da7b9851f2f35f8b8182c69c53ccad9db',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/doc.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'rdoc',
    'RDOC',
    'RIF Dollar On Chain',
    '0x2d919f19D4892381d58EdEbEcA66D5642ceF1A1F',
    18,
    require('assets/tokens/rifd.png'),
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'moc',
    'MOC',
    'Money On Chain',
    '0x9aC7Fe28967b30e3a4E6E03286D715B42B453d10',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/moc.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'irbtc',
    'iRBTC',
    'RBTC Loan Token',
    '0xa9DcDC63eaBb8a2b6f39D7fF9429d88340044a7A',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/rbtc.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'ixusd',
    'iXUSD',
    'XUSD Loan Token',
    '0x8F77ecf69711a4b346f23109c40416BE3dC7f129',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/xusd.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'idoc',
    'iDOC',
    'DOC Loan Token',
    '0xd8D25f03EBbA94E15Df2eD4d6D38276B595593c1',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/doc.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'ibpro',
    'iBPRO',
    'BPRO Loan Token',
    '0x6E2fb26a60dA535732F8149b25018C9c0823a715',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/bpro.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'irusdt',
    'iRUSDT',
    'RUSDT Loan Token',
    '0x849C47f9C259E9D62F289BF1b2729039698D8387',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/usdt.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/sov',
    '(WR)BTC/SOV',
    '(WR)BTC/SOV Liquidity Pool',
    '0x09C5faF7723b13434ABdF1a65aB1B667BC02A902',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/xusd',
    '(WR)BTC/XUSD',
    '(WR)BTC/XUSD Liquidity Pool',
    '0x6f96096687952349DD5944E0EB1Be327DcdeB705',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/fish',
    '(WR)BTC/FISH',
    '(WR)BTC/FISH Liquidity Pool',
    '0x35A74a38Fd7728F1c6BC39aE3b18C974b7979ddD',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/rusdt1',
    '(WR)BTC/USDT1',
    '(WR)BTC/USDT Liquidity Pool1',
    '0x9c4017D1C04cFa0F97FDc9505e33a0D8ac84817F',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/rusdt2',
    '(WR)BTC/USDT2',
    '(WR)BTC/USDT Liquidity Pool2',
    '0x40580E31cc14DbF7a0859f38Ab36A84262df821D',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/bnbs',
    '(WR)BTC/BNBs',
    '(WR)BTC/BNBs Liquidity Pool',
    '0x8f3d24ab3510294f1466aa105f78901b90d79d4d',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/eths',
    '(WR)BTC/ETHs',
    '(WR)BTC/ETHs Liquidity Pool',
    '0xF41Ed702df2B84AcE02772C6a0D8AE46465aA5F4',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/moc',
    '(WR)BTC/MoC',
    '(WR)BTC/MoC Liquidity Pool',
    '0x7Fef930ebaA90B2f8619722adc55e3f1D965B79b',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/doc1',
    'sUSDrBTC1',
    'sUSDrBTC Liquidity Pool1',
    '0x840437BdE7346EC13B5451417Df50586F4dAF836',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/doc2',
    'sUSDrBTC2',
    'sUSDrBTC Liquidity Pool2',
    '0x2dc80332C19FBCd5169ab4a579d87eE006Cb72c0',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/bpro1',
    '(WR)BTC/BPRO1',
    '(WR)BTC/BPRO Liquidity Pool1',
    '0x75e327A83aD2BFD53da12EB718fCCFC68Bc57535',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/bpro2',
    '(WR)BTC/BPRO2',
    '(WR)BTC/BPRO Liquidity Pool2',
    '0x9CE25371426763025C04a9FCd581fbb9E4593475',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/rif',
    '(WR)BTC/RIF',
    '(WR)BTC/RIF Liquidity Pool',
    '0xAE66117C8105a65D914fB47d37a127E879244319',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/mynt',
    '(WR)BTC/MYNT',
    '(WR)BTC/MYNT Liquidity Pool',
    '0x36263AC99ecDcf1aB20513D580B7d8D32D3C439d',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    30,
    'wrbtc/dllr',
    '(WR)BTC/DLLR',
    '(WR)BTC/DLLR Liquidity Pool',
    '0x3D5eDF3201876BF6935090C319FE3Ff36ED3D494',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  // rsk tesnet
  new Asset(
    31,
    'trbtc',
    'tRBTC',
    'Smart Bitcoin',
    constants.AddressZero,
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/rbtc.svg',
    '',
    AssetType.NATIVE,
  ),
  new Asset(
    97,
    'tbnb',
    'tBNB',
    'Binance Coin',
    constants.AddressZero,
    18,
    'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
    '',
    AssetType.NATIVE,
  ),
  new Asset(
    31,
    'tsov',
    'tSOV',
    'Sovryn',
    '0x6a9A07972D07e58F0daf5122d11E069288A375fb',
    18,
    require('assets/tokens/sov.png'),
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'txusd',
    'tXUSD',
    'XUSD',
    '0xa9262cc3fb54ea55b1b0af00efca9416b8d59570',
    18,
    require('assets/tokens/xusd.png'),
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'tdllr',
    'tDLLR',
    'DLLR',
    '0x007b3AA69A846cB1f76b60b3088230A52D2A83AC',
    18,
    require('assets/tokens/dllr.png'),
    'Sovryn Dollar',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'tzusd',
    'tZUSD',
    'ZUSD',
    '0xe67cba98c183a1693fc647d63aeeec4053656dbb',
    18,
    require('assets/tokens/zusd.png'),
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc',
    'twRBTC',
    'Wrapped Smart Bitcoin',
    '0x69FE5cEC81D5eF92600c1A0dB1F11986AB3758Ab',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/rbtc.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'tbpro',
    'tBPRO',
    'BPRO',
    '0x4dA7997A819bb46B6758b9102234c289Dd2ad3bf',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/bpro.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'trif',
    'tRIF',
    'RIF',
    '0x19f64674d8a5b4e652319f5e239efd3bc969a1fe',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/rif.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'trusdt',
    'tRUSDT',
    'RUSDT',
    '0x4D5a316D23eBE168d8f887b4447bf8DbFA4901CC',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/usdt.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'teths',
    'tETHS',
    'Ethereum on Sovryn',
    '0x0Fd0d8D78Ce9299Ee0e5676a8d51F938C234162c',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/eth.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'tbnbs',
    'tBNBS',
    'Binance Coin on Sovryn',
    '0x801F223Def9A4e3a543eAcCEFB79dCE981Fa2Fb5',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/bnb.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'tfish',
    'tFISH',
    'BabelFish',
    '0xaa7038D80521351F243168FefE0352194e3f83C3',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/babelfish.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'tmynt',
    'tMYNT',
    'Mynt',
    '0x139483e22575826183F5b56dd242f8f2C1AEf327',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/mint.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'tdoc',
    'tDOC',
    'Dollar On Chain',
    '0xCB46c0ddc60D18eFEB0E586C17Af6ea36452Dae0',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/doc.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'trdoc',
    'tRDOC',
    'RIF Dollar On Chain',
    '0xc3de9f38581f83e281f260d0ddbaac0e102ff9f8',
    18,
    require('assets/tokens/rifd.png'),
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'tmoc',
    'tMOC',
    'Money On Chain',
    '0x45a97b54021a3f99827641afe1bfae574431e6ab',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/moc.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'tirbtc',
    'tiRBTC',
    'RBTC Loan Token',
    '0xe67Fe227e0504e8e96A34C3594795756dC26e14B',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/rbtc.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'tixusd',
    'tiXUSD',
    'XUSD Loan Token',
    '0xE27428101550f8104A6d06D830e2E0a097e1d006',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/xusd.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'tidoc',
    'tiDOC',
    'DOC Loan Token',
    '0x74e00A8CeDdC752074aad367785bFae7034ed89f',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/doc.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'tibpro',
    'tiBPRO',
    'BPRO Loan Token',
    '0x6226b4B3F29Ecb5f9EEC3eC3391488173418dD5d',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/bpro.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'tirusdt',
    'tiRUSDT',
    'RUSDT Loan Token',
    '0xd1f225BEAE98ccc51c468d1E92d0331c4f93e566',
    18,
    'https://raw.githubusercontent.com/DistributedCollective/Sovryn-frontend/development/src/assets/images/tokens/usdt.svg',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/sov',
    't(WR)BTC/SOV',
    '(WR)BTC/SOV Liquidity Pool',
    '0xdF298421CB18740a7059b0Af532167fAA45e7A98',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/xusd',
    't(WR)BTC/XUSD',
    '(WR)BTC/XUSD Liquidity Pool',
    '0xb89D193c8a9Ae3fadF73B23519c215a0B7DD1B37',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/fish',
    't(WR)BTC/FISH',
    '(WR)BTC/FISH Liquidity Pool',
    '0xe41E262889f89b9a6331680606D9e9AabD01743e',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/rusdt1',
    't(WR)BTC/USDT1',
    '(WR)BTC/USDT Liquidity Pool1',
    '0xfFBBF93Ecd27C8b500Bd35D554802F7F349A1E9B',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/rusdt2',
    't(WR)BTC/USDT2',
    '(WR)BTC/USDT Liquidity Pool2',
    '0x7274305BB36d66F70cB8824621EC26d52ABe9069',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/bnbs',
    't(WR)BTC/BNBs',
    '(WR)BTC/BNBs Liquidity Pool',
    '0xf97A3589c3fE2059fA3AB4819317B77b4BC6c9A8',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/eths',
    't(WR)BTC/ETHs',
    '(WR)BTC/ETHs Liquidity Pool',
    '0xBb5B900EDa0F1459F582aB2436EA825a927f5bA2',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/moc',
    't(WR)BTC/MoC',
    '(WR)BTC/MoC Liquidity Pool',
    '0x6e03DEFD0ae9091Be74f64c8CB9BE319994E5deB',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/doc1',
    'tsUSDrBTC1',
    'sUSDrBTC Liquidity Pool1',
    '0x7F433CC76298bB5099c15C1C7C8f2e89A8370111',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/doc2',
    'tsUSDrBTC2',
    'sUSDrBTC Liquidity Pool2',
    '0x6787161bc4F8d54e6ac6fcB9643Af6f4a12DfF28',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/bpro1',
    't(WR)BTC/BPRO1',
    '(WR)BTC/BPRO Liquidity Pool1',
    '0x98e5F39D8C675972A66ea165040Cb81803c440A3',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/bpro2',
    't(WR)BTC/BPRO2',
    '(WR)BTC/BPRO Liquidity Pool2',
    '0xdaf6FD8370f5245d98E829c766e008cd39E8F060',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/rif',
    't(WR)BTC/RIF',
    '(WR)BTC/RIF Liquidity Pool',
    '0x67fAA17ce83b14B2EA0e643A9030B133edD3Cc43',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/mynt',
    't(WR)BTC/MYNT',
    '(WR)BTC/MYNT Liquidity Pool',
    '0xB12FA09a50c56e9a0C826b98e76DA7645017AB4D',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
  new Asset(
    31,
    'twrbtc/dllr',
    't(WR)BTC/DLLR',
    '(WR)BTC/DLLR Liquidity Pool',
    '0x64B1aC8301f64c92721804ed78f2ee6025aaf7cE',
    18,
    '',
    '',
    AssetType.ERC20,
  ),
]);
