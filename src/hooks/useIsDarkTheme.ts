import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

export function useIsDarkTheme(): boolean {
  const scheme = useColorScheme();
  return useMemo(() => scheme === 'dark', [scheme]);
}
