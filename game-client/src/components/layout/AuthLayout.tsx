import React, { useEffect } from 'react';
import { AppShell, Header, useMantineTheme } from '@mantine/core';
import { Outlet, useNavigate } from 'react-router-dom';
import { useLocalStoredState } from '../../hooks/useLocalStoredState';
import { STORAGE_KEY_SESSION_ID } from '../../constants';

export default function AuthLayout() {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const [sessionId] = useLocalStoredState<string>(STORAGE_KEY_SESSION_ID);

  useEffect(() => {
    if( !sessionId ) navigate('/login')
  }, [sessionId])
  
  return (
    <AppShell
      header={
        <Header height={60} sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing['xs']
        }}>
          {sessionId}
        </Header>
      }
    >
      <Outlet />
    </AppShell>
  )
}