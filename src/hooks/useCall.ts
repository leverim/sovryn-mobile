import { useEffect, useRef, useState } from 'react';

type CallType<T> = () => Promise<T>;

export function useCall<T = string>(callback: CallType<T>) {
  const [value, setValue] = useState<T>();
  const [loading, setLoading] = useState<boolean>(true);

  const callbackRef = useRef<CallType<T>>(callback);

  useEffect(() => {
    setLoading(true);
    callbackRef
      .current()
      .then(setValue)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return {
    value,
    loading,
  };
}
