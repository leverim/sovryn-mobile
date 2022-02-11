# Sovryn Wallet
IOS and Android wallet for sovryn.app created with react-native.
App is created by community members and are not officialy supported by Sovryn team.

Test on:

iOS: [Testflight](https://testflight.apple.com/join/cSfETSV5)

Android: [Google Play](https://play.google.com/apps/testing/com.defray.sovryn)

Latest release:

[iOS App Store](https://apps.apple.com/us/app/sovryn-wallet/id1603993667)

[Google Play](https://play.google.com/store/apps/details?id=com.defray.sovryn)


## Features
List of planned and available features:

- [x] List supported assets and balances
- [x] Send any asset to other wallets (addresses)
- [x] Vested assets (list)
- [x] Vested assets (withdraw unlocked)
- [x] Lending
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
- [x] Balances in USD
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
cd android
./gradlew :app:assembleRelease // .apk
./gradlew :app:bundleRelease // .aab
```
