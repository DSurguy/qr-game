import React from 'react';
import { AppShell, Header, useMantineTheme } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { useLocalStoredState } from '../../hooks/useLocalStoredState';
import { STORAGE_KEY_SESSION_ID } from '../../constants';

export default function AuthLayout() {
  const theme = useMantineTheme();
  const [sessionId] = useLocalStoredState<string>(STORAGE_KEY_SESSION_ID);
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