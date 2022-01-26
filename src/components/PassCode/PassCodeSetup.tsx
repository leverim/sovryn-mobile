import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Button,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { BIOMETRY_TYPE } from 'react-native-keychain';
import { Text } from 'components/Text';

import LockIcon from 'assets/lock-icon.svg';
import { passcode, PassCodeType } from 'controllers/PassCodeController';
import { PASSCODE_LENGTH } from 'utils/constants';
import { DefaultTheme } from '@react-navigation/native';

type PassCodeSetupProps = {
  onPasscodeConfirmed?: (code: string) => void;
};

enum Step {
  NEW_PASSCODE,
  VERIFY_PASSCODE,
  BIOMETRICS,
}

export const PassCodeSetup: React.FC<PassCodeSetupProps> = ({
  onPasscodeConfirmed,
}) => {
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<Step>(Step.NEW_PASSCODE);

  const [code, setCode] = useState('');
  const [inputValue, setInputValue] = useState(code);
  const [supportedBiometrics, setSupportedBiometrics] =
    useState<BIOMETRY_TYPE | null>(null);

  useEffect(() => {
    passcode
      .supportedBiometrics()
      .then(supported => setSupportedBiometrics(supported))
      .catch(() => setSupportedBiometrics(null));
  }, []);

  const handlePasscodeSaving = useCallback(
    async (useBiometrics: boolean) => {
      setLoading(true);
      try {
        await passcode.setPassword(
          code,
          useBiometrics ? PassCodeType.BIOMETRY : PassCodeType.PASSCODE,
        );
        passcode.setUnlocked(true);
        if (onPasscodeConfirmed) {
          onPasscodeConfirmed(code);
        }
        setLoading(false);
      } catch (error) {
        console.warn(error);
        Alert.alert('Failed to save password');
      } finally {
        setLoading(false);
      }
    },
    [code, onPasscodeConfirmed],
  );

  const handleCodeChange = useCallback(
    (value: string) => {
      setInputValue(value);
      if (value.length === PASSCODE_LENGTH) {
        if (step === Step.NEW_PASSCODE) {
          setStep(Step.VERIFY_PASSCODE);
          setInputValue('');
          setCode(value);
        } else if (step === Step.VERIFY_PASSCODE) {
          if (value !== code) {
            setInputValue('');
            Alert.alert('Passcodes does not match!');
          } else {
            if (supportedBiometrics) {
              setStep(Step.BIOMETRICS);
            } else {
              handlePasscodeSaving(false);
            }
          }
        }
      }
    },
    [step, code, supportedBiometrics, handlePasscodeSaving],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Animated.View style={styles.innerContainer}>
        {step === Step.NEW_PASSCODE && (
          <PassCodeSetupKeyboard
            code={inputValue}
            setCode={handleCodeChange}
            title="Enter your new passcode"
          />
        )}
        {step === Step.VERIFY_PASSCODE && (
          <PassCodeSetupKeyboard
            code={inputValue}
            setCode={handleCodeChange}
            title="Verify your new passcode"
          />
        )}
        {step === Step.BIOMETRICS && supportedBiometrics && (
          <PassCodeSetupBiometrics
            disableButtons={loading}
            biometryType={supportedBiometrics}
            onSubmit={handlePasscodeSaving}
          />
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

type PassCodeSetupKeyboardProps = {
  code: string;
  setCode: (value: string) => void;
  title: string;
  onAbort?: () => void;
};

export const PassCodeSetupKeyboard: React.FC<PassCodeSetupKeyboardProps> = ({
  code,
  setCode,
  title,
  onAbort,
}) => {
  return (
    <>
      <TextInput
        value={code}
        onChangeText={setCode}
        ref={ref => {
          if (ref !== undefined && ref && !ref.isFocused()) {
            ref.focus();
          }
        }}
        keyboardType="number-pad"
        maxLength={PASSCODE_LENGTH}
        style={styles.input}
      />
      <View style={styles.iconWrapper}>
        <LockIcon fill="white" width={48} height={48} />
      </View>
      <Text style={styles.titleText}>{title}</Text>
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
      {onAbort && <Button title="Abort" onPress={onAbort} />}
    </>
  );
};

type PassCodeSetupBiometricsProps = {
  biometryType: BIOMETRY_TYPE;
  disableButtons: boolean;
  onSubmit: (useBiometry: boolean) => void;
};

const PassCodeSetupBiometrics: React.FC<PassCodeSetupBiometricsProps> = ({
  biometryType,
  disableButtons,
  onSubmit,
}) => {
  return (
    <View style={styles.innerContainer}>
      <View style={styles.iconWrapper}>
        <LockIcon fill="white" width={48} height={48} />
      </View>
      <Text>Login with {biometryType}</Text>
      <Pressable
        onPress={() => onSubmit(true)}
        disabled={disableButtons}
        style={[
          styles.biometryButton,
          disableButtons && styles.biometryButtonDisabled,
        ]}>
        <Text style={styles.biometryButtonText}>Enable {biometryType}</Text>
      </Pressable>
      <Button
        onPress={() => onSubmit(false)}
        disabled={disableButtons}
        title="Skip"
      />
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
  innerContainer: {
    alignItems: 'center',
  },
  input: {
    opacity: 0,
    width: 0,
    height: 0,
    position: 'absolute',
    top: 0,
    left: 0,
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
  biometryButton: {
    backgroundColor: DefaultTheme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 24,
    width: '100%',
    marginBottom: 6,
  },
  biometryButtonDisabled: {
    opacity: 0.3,
  },
  biometryButtonText: {},
  skipButton: {},
});
