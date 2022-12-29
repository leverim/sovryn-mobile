# Sovryn Wallet
IOS and Android wallet for sovryn.app created with react-native.
App is created by community members and are not officialy supported by Sovryn team.

**Update:** Since *Jun 15, 2022* company Defray Labs OU and app is owned by @grinry (aka @creed-victor, core Sovryn contributor).

Test on:

iOS: [Testflight](https://testflight.apple.com/join/cSfETSV5)

Android: [Google Play](https://play.google.com/apps/testing/com.defray.sovryn)

Latest release:

[iOS App Store](https://apps.apple.com/us/app/sovryn-wallet/id1603993667)

[Google Play](https://play.google.com/store/apps/details?id=com.defray.sovryn)

# Development

Use node v 16, otherwise app may crash because of `crypto` dependency having breaking changes on node@17+
If you are using nvm, ensure that node@16 is default (nvm alias default 16) - to make sure newly opened terminals are using correct node version.

## Features
List of planned and available features:

- [x] List supported assets and balances
- [x] Send any asset to other wallets (addresses)
- [x] Vested assets (list)
- [x] Vested assets (withdraw unlocked)
- [x] Lending
- [x] Liquidity mining
- [x] Swapping
- [x] Multiple wallet accounts
- [x] Read-only accounts
- [x] PIN code and/or biometrics middleware
- [x] Balances in USD
- [x] Transaction history
- [ ] Borrowing
- [ ] Leverage trading
- [ ] Staking
- [ ] Voting in bitocracy
- [ ] Ledger using bluetooth
- [ ] Two-Way Fast-BTC
- [ ] ETH & BSC bridge
- [ ] In-app browser
- [ ] Add & track custom assets
- [ ] Update blockchain state each block
- [ ] Better design / UI / UX

## Compile yourself
You can easily compile binaries from source code using these instructions yourself

Project uses Google Firebase for interaction and crash logs, follow these instructions https://rnfirebase.io/ to setup your account and get these files `android/app/google-services.json` and `ios/GoogleService-Info.plist`.

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

When building on macbook with M1 chip you will need to use Terminal with Rosetta mode enabled.
To enable Rosetta go to Applications -> Utilities, click "Get Info" on Terminal and add "Open using Rosetta" checkbox. You can also dublicate Terminal to new one before enabling Rosetta to be able to use both terminals if needed.

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
