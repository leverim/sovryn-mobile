import React, { useCallback, useContext, useEffect } from 'react';
import { Button, SafeAreaView, Text, View } from 'react-native';
import RNRestart from 'react-native-restart';
import { AppContext } from 'context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { Setting, settings } from 'utils/settings';
import {
  ETH_DERIVATION_PATH,
  RSK_DERIVATION_PATH,
  RSK_TESTNET_DERIVATION_PATH,
} from 'utils/constants';

export const SettingsScreen: React.FC = () => {
  const { signOut } = useContext(AppContext);
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      title: 'Settings',
    });
  }, [navigation]);

  const setDerivationPath = useCallback((path: string) => {
    settings.set(Setting.SELECTED_DPATH, path);
    RNRestart.Restart();
  }, []);

  const setChainId = useCallback((chainId: number) => {
    settings.set(Setting.DEFAULT_CHAIN_ID, chainId);
    RNRestart.Restart();
  }, []);

  return (
    <SafeAreaView>
      <Text>SettingsPage</Text>
      <Button
        title="Account Settings"
        onPress={() => navigation.navigate('settings.account')}
      />
      <Text>Chain ({settings.get(Setting.DEFAULT_CHAIN_ID)})</Text>
      <Button title="RSK Mainnet (30)" onPress={() => setChainId(30)} />
      <Button title="RSK Testnet (31)" onPress={() => setChainId(31)} />
      <Text>Derivation path ({settings.get(Setting.SELECTED_DPATH)}):</Text>
      <Button
        title={`RSK Mainnet - ${RSK_DERIVATION_PATH}`}
        onPress={() => setDerivationPath(RSK_DERIVATION_PATH)}
      />
      <Button
        title={`Ethereum - ${ETH_DERIVATION_PATH}`}
        onPress={() => setDerivationPath(ETH_DERIVATION_PATH)}
      />
      <Button
        title={`RSK Testnet - ${RSK_TESTNET_DERIVATION_PATH}`}
        onPress={() => setDerivationPath(RSK_TESTNET_DERIVATION_PATH)}
      />
      {__DEV__ && (
        <View>
          <Text>Dev only, sign-out and delete all data:</Text>
          <Button title="Sign Out" onPress={signOut} />
        </View>
      )}
    </SafeAreaView>
  );
};
