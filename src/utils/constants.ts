import { Dimensions } from 'react-native';

export const ETH_DERIVATION_PATH = "m/44'/60'/0'/0";
export const RSK_DERIVATION_PATH = "m/44'/137'/0'/0";
export const RSK_TESTNET_DERIVATION_PATH = "m/44'/37310'/0'/0";

const { width, height } = Dimensions.get('window');

export const WINDOW_WIDTH = width;
export const WINDOW_HEIGHT = height;

export const DEFAULT_DERIVATION_PATH = RSK_DERIVATION_PATH;

export const AFFILIATE_ACCOUNT = '0x8a22710b48fC229d5bb23A2e04872dA6a67dc4bE';
export const AFFILIATE_FEE = '5';

export const PASSCODE_LENGTH = 4;

export const DEBUG_SEED =
  'setup tank interest shuffle mobile this devote journey mistake viable right advice';

const sm = 'SovrynMobile';
const prefix = `@${sm}:`;

export const METRICS_OPT_IN = `${prefix}metricsOptIn`;

export const AGREED = 'agreed';

export const DEBUG = `[${sm} DEBUG]:`;

export const STORAGE_BIOMETRY_CHOICE = `${prefix}biometricsChoice`;
export const STORAGE_PASSCODE_CHOICE = `${prefix}passcodeChoice`;
export const STORAGE_PASSCODE_TYPE = `${prefix}passcodeType`;
export const STORAGE_PASSCODE = `${prefix}passcode`;

export const STORAGE_IS_TESTNET = `${prefix}isTestnet`;

export const STORAGE_CACHE = `${prefix}cache`;

export const STORAGE_CACHE_ENABLED_CHAINS = `${prefix}chainsEnabled`;
export const STORAGE_CACHE_SOVRYN_CHAIN = `${prefix}sovrynChain`;

export const STORAGE_CACHE_BALANCES = `${prefix}balances`;
export const STORAGE_CACHE_PRICES = `${prefix}prices`;
export const STORAGE_CACHE_LOAN_POOLS = `${prefix}loanPools`;
export const STORAGE_CACHE_AMM_POOLS = `${prefix}ammPools`;
export const STORAGE_CACHE_TRANSACTIONS = `${prefix}transactions`;
export const STORAGE_CACHE_ADDRESS_BOOK = `${prefix}addressBook`;
