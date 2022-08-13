import React from 'react';
import { AppShell, Header, Text, useMantineTheme } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { useLocalStoredState } from '../../hooks/useLocalStoredState';
import { STORAGE_KEY_SESSION_ID } from '../../constants';

export default function PublicLayout() {
  const theme = useMantineTheme();
  return (
    <AppShell
      header={
        <Header height={60} sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing['xs']
        }}>
          <Text component="title">QR Game</Text>
        </Header>
      }
    >
      <Outlet />
    </AppShell>
  )
}