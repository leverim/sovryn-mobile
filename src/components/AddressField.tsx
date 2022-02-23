import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import {
  DarkTheme,
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { Text } from './Text';
import { ChainId } from 'types/network';
import { currentChainId } from 'utils/helpers';
import { isAddress } from 'utils/rsk';
import AddressBookIcon from 'assets/book-icon.svg';
import QrScannerIcon from 'assets/qr-code-scanner-icon.svg';
import { WalletStackProps } from 'pages/MainScreen/WalletPage';
import { addressBookSelection } from 'pages/WalletScreen/AddressBookScreen';
import { useAddressBook } from 'hooks/useAddressBook';
import { QrScannerModal } from './QrScannerModal';
import { getNetworkByChainId } from 'utils/network-utils';

export type AddressFieldProps = {
  chainId?: ChainId;
  title?: React.ReactNode;
  value: string;
  onChange: (address: string, valid: boolean) => void;
  inputProps?: TextInputProps;
  rightElement?: React.ReactNode;
  bottomElement?: React.ReactNode;
  containerStyle?: ViewStyle;
  hideAddressBook?: boolean;
  hideQrCodeScanner?: boolean;
};

const DEFAULT_INPUT_TEXT_SIZE = 32;
const SPACE_FOR_LETTER = 24;

export const AddressField: React.FC<AddressFieldProps> = ({
  value,
  onChange,
  inputProps,
  containerStyle,
  title,
  chainId = currentChainId(),
  hideAddressBook,
  hideQrCodeScanner,
}) => {
  const { get } = useAddressBook();
  const navigation = useNavigation<NavigationProp<WalletStackProps>>();
  const changedManually = useRef<boolean>(false);
  const [_value, setValue] = useState(value);

  useEffect(() => setValue(value), [value]);

  // Test if input value can't be considered address.
  const notAddress = useMemo(
    () => !/^(0x)?[0-9a-f]{40}$/i.test(_value),
    [_value],
  );
  // Test if input value is valid checksumed address.
  const validAddress = useMemo(
    () => isAddress(_value, chainId),
    [_value, chainId],
  );

  const onChangeText = useCallback(
    (address: string) => {
      changedManually.current = true;
      setValue(address);
      const valid = isAddress(address, chainId);
      if (valid) {
        onChange(address, valid);
      } else {
        onChange('', false);
      }
    },
    [onChange, chainId],
  );

  const inputRef = useRef<TextInput | null>(null);
  const [inputWidth, setInputWidth] = useState(0);
  const [fontSize, setFontSize] = useState(DEFAULT_INPUT_TEXT_SIZE);

  useEffect(() => {
    const width = (_value?.length || 1) * SPACE_FOR_LETTER;
    if (width > inputWidth) {
      const percentage = inputWidth / width;
      const scaledSize = Math.min(
        DEFAULT_INPUT_TEXT_SIZE,
        Math.max(DEFAULT_INPUT_TEXT_SIZE * percentage, 16),
      );
      setFontSize(scaledSize);
    } else {
      setFontSize(DEFAULT_INPUT_TEXT_SIZE);
    }
  }, [_value, inputWidth]);

  const _id = useMemo(() => Date.now().toString(), []);

  useFocusEffect(
    useCallback(() => {
      if (!changedManually.current) {
        const addressItem = addressBookSelection[_id];
        if (addressItem) {
          onChangeText(addressItem.address.toLowerCase());
        }
      }
    }, [_id, onChangeText]),
  );

  const openAddressBook = useCallback(() => {
    changedManually.current = false;
    navigation.navigate('addressbook', { id: _id, address: _value || value });
  }, [_id, _value, navigation, value]);

  const [openScanner, setOpenScanner] = useState(false);

  const openQrScanner = useCallback(() => {
    setOpenScanner(true);
  }, []);

  const handleScannerResult = useCallback(
    (text: string) => {
      if (isAddress(text.toLowerCase())) {
        onChangeText(text);
      } else {
        Alert.alert('Address is not valid.');
      }
    },
    [onChangeText],
  );

  const name = useMemo(() => get(value)?.name, [get, value]);

  const network = useMemo(() => getNetworkByChainId(chainId), [chainId]);

  return (
    <>
      <View style={[styles.container, containerStyle]}>
        {title}
        <View style={styles.inputWrapperView}>
          <TextInput
            ref={inputRef}
            value={_value}
            onChangeText={onChangeText}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, inputProps?.style, { fontSize }]}
            placeholderTextColor={'gray'}
            onLayout={event => setInputWidth(event.nativeEvent.layout.width)}
            multiline={true}
            numberOfLines={2}
            placeholder="Wallet address"
            {...inputProps}
          />
          <View style={styles.inputAddonView}>
            {!hideQrCodeScanner && (
              <Pressable style={styles.buttonView} onPress={openQrScanner}>
                <QrScannerIcon fill="white" />
              </Pressable>
            )}
            {!hideAddressBook && (
              <Pressable style={styles.buttonView} onPress={openAddressBook}>
                <AddressBookIcon fill="white" />
              </Pressable>
            )}
          </View>
        </View>
        {!!_value.length && (
          <View style={styles.bottomElementView}>
            {notAddress ? (
              <View>
                <Text>Enter valid wallet address.</Text>
              </View>
            ) : !validAddress ? (
              <View style={styles.checksumWarning}>
                <Text onPress={() => onChangeText(_value.toLowerCase())}>
                  Not valid {network.name} address.{' '}
                  <Text style={{ color: DarkTheme.colors.primary }}>
                    Lowercase?
                  </Text>
                </Text>
              </View>
            ) : (
              <View>
                <Text>{name}</Text>
              </View>
            )}
          </View>
        )}
      </View>
      <QrScannerModal
        visible={openScanner}
        onClose={() => setOpenScanner(false)}
        onScanned={handleScannerResult}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: DarkTheme.colors.border,
    borderRadius: 12,
    marginVertical: 4,
    width: '100%',
  },
  inputWrapperView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 12,
  },
  input: {
    fontSize: 36,
    flex: 1,
    flexShrink: 1,
    flexGrow: 1,
    color: 'white',
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'top',
    maxHeight: 64,
  },
  inputAddonView: {
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomElementView: {},
  buttonView: {
    padding: 8,
    marginLeft: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 8,
  },
  checksumWarning: {
    flexDirection: 'row',
  },
});
