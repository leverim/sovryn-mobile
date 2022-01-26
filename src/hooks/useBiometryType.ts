import { passcode } from 'controllers/PassCodeController';
import { useEffect, useState } from 'react';
import { BIOMETRY_TYPE } from 'react-native-keychain';

const cache: { value: BIOMETRY_TYPE | null } = { value: null };

export function useBiometryType(): BIOMETRY_TYPE | null {
  const [value, setValue] = useState<BIOMETRY_TYPE | null>(cache.value);

  useEffect(() => {
    passcode
      .supportedBiometrics()
      .then(result => {
        setValue(result);
        cache.value = result;
      })
      .catch(() => setValue(null));
  }, []);

  return value;
}
