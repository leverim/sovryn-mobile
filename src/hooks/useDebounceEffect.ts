import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

export function useDebouncedEffect(
  effect: EffectCallback,
  delay: number,
  deps: DependencyList,
  _firstTime: boolean = false,
) {
  const data = useRef<{ firstTime: boolean; clearFunc?: void | unknown }>({
    firstTime: _firstTime,
  });
  useEffect(() => {
    const { firstTime, clearFunc } = data.current;

    if (firstTime) {
      data.current.firstTime = false;
      return;
    }

    const handler = setTimeout(() => {
      if (clearFunc && typeof clearFunc === 'function') {
        clearFunc();
      }
      data.current.clearFunc = effect();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
    // we dont need effect to be as dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...deps]);
}
