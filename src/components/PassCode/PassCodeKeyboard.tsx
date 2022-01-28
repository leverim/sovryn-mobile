import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'components/Text';

import LockIcon from 'assets/lock-icon.svg';
import BiometricsIcon from 'assets/fingerprint-icon.svg';
import { passcode } from 'controllers/PassCodeController';
import { AppContext } from 'context/AppContext';
import { PASSCODE_LENGTH } from 'utils/constants';

type PassCodeKeyboardProps = {
  onPasscodeVerified?: (code: string) => void;
};

const KEYBOARD_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

export const PassCodeKeyboard: React.FC<PassCodeKeyboardProps> = ({
  onPasscodeVerified,
}) => {
  const { signOut } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);

  const handleKeyPress = useCallback(
    (key: number) => () => {
      if (!loading) {
        setCode(prevCode =>
          prevCode.length < PASSCODE_LENGTH ? `${prevCode}${key}` : prevCode,
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
    passcode.supportedBiometrics().then(supported => {
      setIsBiometricsEnabled(!!supported);
      if (supported) {
        onBiometricsPress();
      }
    });
  }, [onBiometricsPress]);

  const verifyPasscode = useCallback(async () => {
    setLoading(true);
    const verify = await passcode.verify(code);
    passcode.setUnlocked(true);
    if (verify) {
      if (onPasscodeVerified) {
        onPasscodeVerified(code);
      }
    } else {
      setCode('');
      Alert.alert('Access denied.');
    }
  }, [code, onPasscodeVerified]);

  useEffect(() => {
    if (code.length === PASSCODE_LENGTH) {
      verifyPasscode();
    }
    return () => setLoading(false);
  }, [code, verifyPasscode]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <LockIcon fill="white" width={48} height={48} />
      </View>
      <Text style={styles.titleText}>Enter Sovryn Wallet Passcode</Text>
      <View style={styles.bulletWrapper}>
        {[...Array(PASSCODE_LENGTH)].map((_, item) => (
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
        {__DEV__ ? (
          <Pressable onPress={signOut} style={styles.resetButton}>
            <Text>Reset</Text>
          </Pressable>
        ) : (
          <View />
        )}
        {isBiometricsEnabled ? (
          <Pressable
            onPress={onBiometricsPress}
            style={styles.biometricsButton}>
            <BiometricsIcon fill="white" width={36} height={36} />
          </Pressable>
        ) : (
          <View />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap',
    width: 250,
    marginBottom: 8,
  },
  biometricsButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  resetButton: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
});
