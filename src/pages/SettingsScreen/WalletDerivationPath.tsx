import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { SettingsStackProps } from 'routers/settings.routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { NavItem } from 'components/NavGroup/NavItem';
import { globalStyles } from 'global.styles';
import { Text } from 'components/Text';
import { accounts, AccountType } from 'utils/accounts';
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
import { Button } from 'components/Buttons/Button';

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
  navigation,
}) => {
  const chainId = currentChainId();

  const { account, password } = params;

  const [derivationPath, setDerivationPath] = useState<string>(account.dPath!);
  const [selectedWallet, setSelectedWallet] = useState<number>(account.index!);
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

  const wallets = useMemo(() => {
    if (!masterSeed) {
      return [];
    }
    return [...Array(PER_PAGE)].map(
      (_, _index) => page * PER_PAGE - PER_PAGE + _index,
    );
  }, [masterSeed, page]);

  const handleChange = useCallback(() => {
    console.log('params', params.index);
    console.log('selected', selectedWallet);
    accounts.update(params.index, {
      index: selectedWallet,
      address: toChecksumAddress(
        new Wallet(
          makeWalletPrivateKey(
            AccountType.MNEMONIC,
            masterSeed!,
            derivationPath,
            selectedWallet,
          ),
        ).address,
        chainId,
      ),
      dPath: derivationPath,
    });
    navigation.navigate('settings.wallet', { index: params.index });
  }, [
    chainId,
    derivationPath,
    masterSeed,
    navigation,
    params.index,
    selectedWallet,
  ]);

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
              key={item}
              index={item}
              masterSeed={masterSeed}
              derivationPath={derivationPath}
              chainId={chainId}
              onPress={() => setSelectedWallet(item)}
              danger={item === selectedWallet}
            />
          ))}
        </NavGroup>

        <View style={styles.paginator}>
          <View style={styles.buttonView}>
            <Button
              title="Previuos"
              onPress={() => setPage(page - 1)}
              disabled={!(page > 1)}
              style={[styles.button, !(page > 1) && styles.buttonDisabled]}
              primary
            />
          </View>
          <View style={styles.buttonView}>
            <Button
              title="Next"
              onPress={() => setPage(page + 1)}
              primary
              style={styles.button}
            />
          </View>
        </View>

        <Button title="Apply Changes" onPress={handleChange} primary />

        <View style={globalStyles.spacer} />
      </ScrollView>
    </SafeAreaPage>
  );
};

const styles = StyleSheet.create({
  paginator: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: -6,
  },
  buttonView: {
    flex: 1,
    paddingHorizontal: 6,
  },
  button: {
    paddingHorizontal: 3,
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
