import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ContractName } from 'types/contract';
import { BigNumber } from 'ethers';
import { utils } from 'ethers/lib.esm';
import { useVestedAssets } from 'hooks/useVestedAssets';
import { Token } from 'types/token';

type VestedAssetsProps = {
  registryContractName: ContractName;
  owner: string;
  asset: Token;
};

export const VestedAssets: React.FC<VestedAssetsProps> = ({
  registryContractName,
  owner,
  asset,
}) => {
  const navigation = useNavigation();

  const { vestings, balances } = useVestedAssets(registryContractName, owner);

  const balance = useMemo(
    () =>
      utils.formatUnits(
        balances.reduce((p, c) => p.add(c), BigNumber.from(0)),
        asset.decimals,
      ),
    [balances, asset],
  );

  if (!vestings.length) {
    return null;
  }

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() =>
          navigation.navigate('wallet.vestings', {
            registryContractName,
            owner,
            asset,
          })
        }>
        <View style={styles.container}>
          <View style={styles.textWrapper}>
            <View style={styles.textWrapperRow}>
              <Text style={styles.textRow1}>Vested {asset.symbol}</Text>
              <Text style={styles.textRow1}>{Number(balance).toFixed(4)}</Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 4,
  },
  textWrapper: {
    flexBasis: 1,
    flexGrow: 1,
    flexDirection: 'column',
  },
  textWrapperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textRow1: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  textRow2: {
    fontWeight: '300',
  },
});
