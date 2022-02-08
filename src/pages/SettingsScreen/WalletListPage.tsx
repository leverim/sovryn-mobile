import React, { useContext, useLayoutEffect } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { AppContext } from 'context/AppContext';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { SettingsStackProps } from 'routers/settings.routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavGroup } from 'components/NavGroup/NavGroup';
import { globalStyles } from 'global.styles';
import { WalletListItem } from './components/MyWallets/WalletListItem';
import AddBoxIcon from 'assets/add-box-icon.svg';
import { DarkTheme } from '@react-navigation/native';

type Props = NativeStackScreenProps<SettingsStackProps, 'settings.wallets'>;

export const WalletListPage: React.FC<Props> = ({ navigation }) => {
  const { accountList } = useContext(AppContext);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('settings.create')}>
          <AddBoxIcon fill={DarkTheme.colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation]);

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
      </ScrollView>
    </SafeAreaPage>
  );
};
