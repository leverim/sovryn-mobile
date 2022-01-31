import React, { useCallback, useContext, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountType } from 'utils/accounts';
import { AppContext } from 'context/AppContext';
import { passcode } from 'controllers/PassCodeController';
import { SettingsStackProps } from 'pages/MainScreen/SettingsPage';
import { ImportWalletView } from 'components/WalletCreation/ImportWalletView';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.index'>;

export const AccountCreate: React.FC<Props> = ({ navigation }) => {
  const { createWallet } = useContext(AppContext);

  const [loading, setLoading] = useState(false);

  const handleImport = useCallback(
    async (name: string, secret: string, type: AccountType) => {
      setLoading(true);
      try {
        const password = await passcode.request('Lock Wallet');
        createWallet(name, type, secret, password)
          .then(() => {
            setLoading(false);
            navigation.navigate('settings.wallets');
          })
          .catch(error => {
            setLoading(false);
            console.error('creating failed', error);
          });
      } catch (e) {
        console.log(e);
      }
    },
    [navigation, createWallet],
  );

  return <ImportWalletView onHandleImport={handleImport} loading={loading} />;
};
