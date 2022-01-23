import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'components/Text';

import LockIcon from 'assets/lock-icon.svg';
import BiometricsIcon from 'assets/fingerprint-icon.svg';
import { passcode } from 'controllers/PassCodeController';

type PassCodeKeyboardProps = {
  onPasscode?: (code: string) => void;
};

const PASSCODE_CHAR_COUNT = 6;

const KEYBOARD_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

export const PassCodeKeyboard: React.FC<PassCodeKeyboardProps> = ({
  onPasscode,
}) => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);

  const handleKeyPress = useCallback(
    (key: number) => () => {
      if (!loading) {
        setCode(prevCode =>
          prevCode.length < PASSCODE_CHAR_COUNT
            ? `${prevCode}${key}`
            : prevCode,
        );
      }
    },
    [loading],
  );

  const handleDeletePress = useCallback(() => setCode(''), []);

  const onBiometricsPress = useCallback(async () => {
    try {
      const password = await passcode.unlock();
      setCode(password ? password : '');
    } catch (error) {
      setCode('');
      console.error(error);
    }
  }, []);

  useEffect(() => {
    console.log('init');
    passcode.supportedBiometrics().then(supported => {
      console.log(supported);
      setIsBiometricsEnabled(!!supported);
      if (supported) {
        onBiometricsPress();
      }
    });
  }, [onBiometricsPress]);

  useEffect(() => {
    if (code.length === PASSCODE_CHAR_COUNT) {
      setLoading(true);
      if (onPasscode) {
        onPasscode(code);
      }
    }
    return () => setLoading(false);
  }, [code, onPasscode]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <LockIcon fill="white" width={48} height={48} />
      </View>
      <Text style={styles.titleText}>Enter Defray Passcode</Text>
      <View style={styles.bulletWrapper}>
        {[...Array(PASSCODE_CHAR_COUNT)].map((_, item) => (
          <View
            key={item}
            style={[
              styles.bullet,
              item + 1 <= code.length && styles.bulltetActive,
            ]}
          />
        ))}
      </View>
      <View style={styles.keyboardContainer}>
        {KEYBOARD_KEYS.map(item => (
          <Pressable
            key={item}
            onPress={handleKeyPress(item)}
            style={styles.keyboardButton}>
            <View style={styles.keyboardButtonView}>
              <Text style={styles.keyboardButtonText}>{item}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      <View style={styles.footerContainer}>
        {isBiometricsEnabled && (
          <Pressable
            onPress={onBiometricsPress}
            style={styles.biometricsButton}>
            <BiometricsIcon fill="white" width={36} height={36} />
          </Pressable>
        )}
        <Pressable onPress={handleDeletePress} style={styles.deleteButton}>
          <Text>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  titleText: {
    fontSize: 18,
    marginBottom: 24,
  },
  bulletWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap',
    width: 200,
    borderWidth: 1,
    marginBottom: 36,
  },
  bullet: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  bulltetActive: {
    backgroundColor: 'white',
  },
  keyboardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: 250,
  },
  keyboardButton: {
    width: 83,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardButtonView: {
    width: 52,
    height: 52,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  keyboardButtonText: {
    fontSize: 18,
  },
  footerContainer: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'nowrap',
    width: 200,
  },
  biometricsButton: {},
  deleteButton: {
    marginLeft: 36,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
