import { isEqual } from 'lodash';
import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

export function deepCompareEquals<T>(a: T, b: T) {
  return isEqual(a, b);
}

export function useDeepCompareMemo<T>(value: T) {
  const ref = useRef<T>();

  if (!deepCompareEquals(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

export function useDeepCompareEffect(
  effect: EffectCallback,
  deps?: DependencyList,
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, deps?.map(useDeepCompareMemo));
}
