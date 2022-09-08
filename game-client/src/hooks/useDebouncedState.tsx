import React, { useEffect, useState } from 'react';

/**
 * Identical to react useState, except the setter is debounced
 * @param durationMs How long to debounce in milliseconds
 */
export default function useDebouncedState<T>(initialValue: T, durationMs: number = 500) {
  const [value, setValueInternal] = useState<T>(initialValue)
  const [timeoutId, setTimeoutId] = useState(0);

  useEffect(() => () => {
    if( setTimeoutId ) window.clearTimeout(timeoutId);
  }, [])

  const setValue = (newValue: T) => {
    if( setTimeoutId ) window.clearTimeout(timeoutId);
    setTimeoutId(window.setTimeout(() => {
      setValueInternal(newValue);
      window.clearTimeout(timeoutId);
      setTimeoutId(0);
    }, durationMs))
  }

  return [
    value,
    setValue,
    !!timeoutId
  ] as [
    value: T,
    setValue: typeof setValue,
    isDebouncing: boolean
  ]
}