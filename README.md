# Sovryn Wallet
IOS and Android wallet for sovryn.app created with react-native.
App is created by community members and are not officialy supported by Sovryn team.

## Features
List of planned and available features:

- [x] List supported assets and balances
- [x] Send any asset to other wallets (addresses)
- [x] Vested assets (list)
- [x] Vested assets (withdraw unlocked)
- [ ] Lending
- [ ] Liquidity mining
- [ ] Borrowing
- [x] Swapping
- [ ] Leverage trading
- [ ] Staking
- [ ] Voting in bitocracy
- [x] Multiple wallet accounts
- [x] Read-only accounts
- [ ] Ledger using bluetooth
- [ ] Transaction history
- [ ] Two-Way Fast-BTC
- [ ] ETH & BSC bridge
- [ ] In-app browser
- [x] PIN code and/or biometrics middleware
- [ ] Add & track custom assets
- [ ] Update blockchain state each block
- [ ] Balances in USD
- [ ] Better design / UI / UX

## Compile yourself
You can easily compile binaries from source code using these instructions yourself

### iOS
To compile source code for ios usage you will need apple computer with xcode installed.
```
git clone git@github.com:defray-labs/sovryn-mobile.git
cd sovryn-mobile
yarn install
npx react-native run-ios --configuration Release --device
// or if you want to run on simulator
npx react-native run-ios --configuration Release
```

### Android
We havent tested app on android yet, most likely building would crash because of some unsupported features on react-native for android.
Will update instructions once we will apply some android polyfills.

```
git clone git@github.com:defray-labs/sovryn-mobile.git
cd sovryn-mobile
yarn install
// list available devices
adb devices
// pass deviceId you got in "adb devices"
npx react-native run-android --deviceId abcd
```
