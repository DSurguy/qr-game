import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEY_SESSION_ID } from '../constants';
import { useLocalStoredState } from '../hooks/useLocalStoredState';

export default function RedirectRoute() {
  const navigate = useNavigate();
  const [sessionId] = useLocalStoredState<string>(STORAGE_KEY_SESSION_ID);

  useEffect(() => {
    if( sessionId ) navigate('/game/me')
    else navigate('/login')
  }, [])

  return <></>;
}