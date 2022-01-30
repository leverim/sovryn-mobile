import { passcode } from 'controllers/PassCodeController';
import { useEffect, useMemo, useState } from 'react';
import { BIOMETRY_TYPE } from 'react-native-keychain';

const cache: { value: BIOMETRY_TYPE | null } = {
  value: null,
};

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

export function usePrettyBiometryName(): string | null {
  const type = useBiometryType();
  const name = useMemo(() => {
    switch (type) {
      case BIOMETRY_TYPE.FACE_ID:
        return 'Face ID';
      case BIOMETRY_TYPE.FACE:
        return 'Face Recognition';
      case BIOMETRY_TYPE.TOUCH_ID:
        return 'Touch ID';
      case BIOMETRY_TYPE.FINGERPRINT:
        return 'Fingerprints';
      case BIOMETRY_TYPE.IRIS:
        return 'Iris';
      default:
        return null;
    }
  }, [type]);

  return name;
}
