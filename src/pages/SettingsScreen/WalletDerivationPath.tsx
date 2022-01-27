import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { AppContext } from 'context/AppContext';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { SettingsStackProps } from 'pages/MainScreen/SettingsPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { NavItem } from 'components/NavGroup/NavItem';
import { globalStyles } from 'global.styles';
import { Text } from 'components/Text';
import { accounts, AccountType } from 'utils/accounts';
import { passcode } from 'controllers/PassCodeController';
import { makeWalletPrivateKey, wallet } from 'utils/wallet';
import { Wallet } from 'ethers';
import { currentChainId } from 'utils/helpers';
import { toChecksumAddress } from 'utils/rsk';
import { WalletAddressItem } from './components/MyWallets/WalletAddressItem';
import {
  ETH_DERIVATION_PATH,
  RSK_DERIVATION_PATH,
  RSK_TESTNET_DERIVATION_PATH,
} from 'utils/constants';

type Props = NativeStackScreenProps<
  SettingsStackProps,
  'settings.wallet.derivation'
>;

const PER_PAGE = 10;

const dPaths = [
  RSK_DERIVATION_PATH,
  RSK_TESTNET_DERIVATION_PATH,
  ETH_DERIVATION_PATH,
];

export const WalletDerivationPath: React.FC<Props> = ({
  route: { params },
}) => {
  const chainId = currentChainId();

  const { account, password } = params;

  const [derivationPath, setDerivationPath] = useState<string>(account.dPath!);
  const [selectedWallet, setSelectedWallet] = useState<{
    index: number;
    address: string;
  }>({ index: account.index!, address: account.address! });
  const [masterSeed, setMasterSeed] = useState<string>();
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    wallet
      .unlockWalletSecrets(password, account.secret!)
      .then(response => response.masterSeed)
      .then(setMasterSeed)
      .catch(e => {
        console.log(e);
      });
  }, [password, account.secret]);

  // const account = accounts.get(params.index);
  // navigation.setOptions({ title: account.name });

  // const activate = useCallback(
  //   () => accounts.select(params.index),
  //   [params.index],
  // );

  const wallets = useMemo(() => {
    if (!masterSeed) {
      return [];
    }
    return [...Array(PER_PAGE)]
      .map((_, _index) => page * PER_PAGE - PER_PAGE + _index)
      .map(item => ({
        index: item,
        address: toChecksumAddress(
          new Wallet(
            makeWalletPrivateKey(
              AccountType.MNEMONIC,
              masterSeed,
              derivationPath,
              item,
            ),
          ).address,
          chainId,
        ),
      }));
  }, [masterSeed, page, derivationPath, chainId]);

  const handleChange = useCallback(() => {
    accounts.update(params.index, {
      index: selectedWallet.index,
      address: toChecksumAddress(
        new Wallet(
          makeWalletPrivateKey(
            AccountType.MNEMONIC,
            masterSeed!,
            derivationPath,
            selectedWallet.index,
          ),
        ).address,
        chainId,
      ),
      dPath: derivationPath,
    });
  }, [chainId, derivationPath, masterSeed, params.index, selectedWallet.index]);

  if (!masterSeed) {
    return <></>;
  }

  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <Text style={globalStyles.title}>Derivation Path</Text>
        <NavGroup>
          {dPaths.map(item => (
            <NavItem
              key={item}
              title={item}
              onPress={() => setDerivationPath(item)}
              danger={derivationPath === item}
            />
          ))}
        </NavGroup>
        <Text style={globalStyles.title}>Account</Text>
        <NavGroup>
          {wallets.map(item => (
            <WalletAddressItem
              key={item.index}
              index={item.index}
              address={item.address}
              onPress={() => setSelectedWallet(item)}
              danger={item.index === selectedWallet.index}
            />
          ))}
        </NavGroup>

        <View>
          <NavGroup>
            {page > 1 && (
              <NavItem
                title="Previuos Page"
                onPress={() => setPage(page - 1)}
              />
            )}
            <NavItem title="Next Page" onPress={() => setPage(page + 1)} />
          </NavGroup>
        </View>

        <NavGroup>
          <NavItem title="Save" onPress={handleChange} />
        </NavGroup>

        <View style={globalStyles.spacer} />
      </ScrollView>
    </SafeAreaPage>
  );
};
