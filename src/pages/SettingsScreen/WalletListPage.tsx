import React, { useContext } from 'react';
import { ScrollView } from 'react-native';
import { AppContext } from 'context/AppContext';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { SettingsStackProps } from 'pages/MainScreen/SettingsPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { NavItem } from 'components/NavGroup/NavItem';
import { globalStyles } from 'global.styles';
import { WalletListItem } from './components/MyWallets/WalletListItem';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.wallets'>;

export const WalletListPage: React.FC<Props> = ({ navigation }) => {
  const { accountList } = useContext(AppContext);
  return (
    <SafeAreaPage>
      <ScrollView style={globalStyles.page}>
        <NavGroup>
          {accountList.map((item, index) => (
            <WalletListItem
              key={index}
              account={item}
              onPress={() => navigation.navigate('settings.wallet', { index })}
            />
          ))}
        </NavGroup>
        <NavGroup>
          <NavItem
            title="Add another wallet"
            onPress={() => navigation.navigate('settings.create')}
          />
        </NavGroup>
      </ScrollView>
    </SafeAreaPage>
  );
};
