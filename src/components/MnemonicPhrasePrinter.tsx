import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { DarkTheme } from '@react-navigation/native';
import { ButtonBase } from './Buttons/Button';
import { Text } from './Text';
import CopyIcon from 'assets/copy-icon.svg';

type MnemonicPhrasePrinterProps = {
  text: string;
};

export const MnemonicPhrasePrinter: React.FC<MnemonicPhrasePrinterProps> =
  React.memo(({ text }) => {
    const words = useMemo(() => text.split(' '), [text]);
    return (
      <View>
        <View style={styles.container}>
          {words.map((word, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.number}>{index + 1}</Text>
              <Text style={styles.word}>{word}</Text>
            </View>
          ))}
        </View>
        <View>
          <ButtonBase
            onPress={() => Clipboard.setString(text)}
            pressableStyle={styles.copy}>
            <CopyIcon fill={DarkTheme.colors.primary} style={styles.copyIcon} />
            <Text>Copy</Text>
          </ButtonBase>
        </View>
      </View>
    );
  });

const styles = StyleSheet.create({
  container: {
    backgroundColor: DarkTheme.colors.card,
    borderRadius: 8,
    padding: 12,
    paddingTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  item: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
  },
  number: {
    opacity: 0.4,
    marginRight: 12,
    width: 24,
    textAlign: 'right',
  },
  word: {},
  copy: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyIcon: {
    marginRight: 8,
  },
});
