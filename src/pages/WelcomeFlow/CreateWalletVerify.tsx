import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { shuffle } from 'lodash';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { Text } from 'components/Text';
import { WelcomeFlowStackProps } from '.';
import { AccountType } from 'utils/accounts';
import { globalStyles } from 'global.styles';
import { Button } from 'components/Buttons/Button';
import { InputField } from 'components/InputField';
import { DarkTheme } from '@react-navigation/native';

type Props = NativeStackScreenProps<
  WelcomeFlowStackProps,
  'onboarding.create.verify'
>;

export const CreateWalletVerify: React.FC<Props> = ({
  navigation,
  route: { params },
}) => {
  const [name, setName] = useState('Sovryn Wallet #1');
  const [secret, setSecret] = useState('');

  const mnemonic = useMemo(() => params.seed.split(' '), [params]);

  const items = useMemo(() => shuffle(mnemonic), [mnemonic]);
  const used = useMemo(() => secret.split(' ').filter(Boolean), [secret]);
  const next = useMemo(() => mnemonic[used.length], [mnemonic, used]);

  const handleClick = useCallback((text: string) => {
    setSecret(prevValue => `${prevValue} ${text}`.trim());
  }, []);

  const handleContinue = useCallback(
    () =>
      navigation.navigate('onboarding.passcode', {
        name,
        secret: params.seed,
        type: AccountType.MNEMONIC,
      }),
    [navigation, name, params.seed],
  );

  return (
    <SafeAreaPage
      keyboardAvoiding
      scrollView
      scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <PageContainer>
        <Text style={[globalStyles.title, styles.title]}>
          Confirm your recovery phrase
        </Text>

        <InputField label="Wallet Name" value={name} onChangeText={setName} />

        <InputField
          label="Please, tap on the words in correct order:"
          value={secret}
          multiline
          numberOfLines={12}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          editable={false}
        />

        <View style={styles.wordList}>
          {items.map(item => (
            <Word
              key={item}
              text={item}
              nextWord={next}
              used={used.includes(item)}
              onPress={handleClick}
            />
          ))}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          primary
          disabled={params.seed !== secret}
        />
      </PageContainer>
    </SafeAreaPage>
  );
};

type WordProps = {
  text: string;
  onPress: (text: string) => void;
  nextWord?: string;
  used: boolean;
};

const Word: React.FC<WordProps> = ({ text, onPress, nextWord, used }) => {
  const handlePress = useCallback(
    () => nextWord === text && onPress(text),
    [nextWord, text, onPress],
  );

  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      key={text}
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={used}
      style={[
        styles.wordButton,
        used && styles.wordButtonUsed,
        pressed && styles.pressedIn,
        pressed && nextWord !== text && styles.pressedInWrong,
      ]}>
      <Text>{text}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 18,
  },
  wordList: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: 12,
  },
  wordButton: {
    backgroundColor: DarkTheme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 6,
    margin: 4,
    borderRadius: 8,
  },
  wordButtonPressed: {
    transform: [{ scale: 1.05 }],
  },
  wordButtonUsed: {
    backgroundColor: DarkTheme.colors.border,
  },
  pressedIn: {
    transform: [{ scale: 1.05 }],
  },
  pressedInWrong: {
    backgroundColor: DarkTheme.colors.notification,
  },
});
