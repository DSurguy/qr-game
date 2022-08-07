import React, { useEffect, useState } from 'react';
import { EventedStorage, StorageType } from '../services/eventedLocalStorage';

const getLocalStorageItem = (key: string, parse: boolean = false) => {
  const value = localStorage.getItem(key);
  if( value === undefined || value === null ) return null;
  else if( parse ){
    return JSON.parse(value);
  }
  else return value;
}

const eventedLocalStorage = new EventedStorage(StorageType.local);

/**
 * Persist and retrieve a state value to/from localstorage.
 * If the key does not exist, the value will be initialized to null.
 * If the value type is NOT a string, the value will be run through JSON.parse()
 * 
 * @param key 
 */
export function useLocalStoredState<T>(key: string) {
  const [value, setValue] = useState<T | null>(getLocalStorageItem(key))

  useEffect(() => {
    const setHandler = () => {
      setValue(getLocalStorageItem(key))
    }

    const removeHandler = () => {
      setValue(null);
    }

    eventedLocalStorage.onSetItem(setHandler, key)
    eventedLocalStorage.onRemoveItem(removeHandler, key)

    return () => {
      eventedLocalStorage.offSetItem(setHandler, key)
      eventedLocalStorage.offRemoveItem(removeHandler, key)
    }
  }, [])

  const setItem = (nextValue: T) => {
    localStorage.setItem(
      key,
      typeof nextValue === 'string'
        ? nextValue
        : JSON.stringify(nextValue)
    )
  }

  const removeItem = () => {
    localStorage.removeItem(key)
    setValue(null)
  }

  return [
    value as T,
    setItem,
    removeItem
  ] as const
}