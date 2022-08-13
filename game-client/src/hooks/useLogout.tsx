import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEY_SESSION_ID } from '../constants';
import { useLocalStoredState } from './useLocalStoredState';

export default function useLogout() {
  const navigate = useNavigate()
  const [,,removeItem] = useLocalStoredState(STORAGE_KEY_SESSION_ID)

  return () => {
    removeItem();
    navigate('/login', {
      replace: true
    });
  }
}