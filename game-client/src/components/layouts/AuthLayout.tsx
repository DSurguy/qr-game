import React from 'react';
import { AppShell, Header, useMantineTheme } from '@mantine/core';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  const theme = useMantineTheme();
  return (
    <AppShell
      header={
        <Header height={60} sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing['xs']
        }}>
          Header Test
        </Header>
      }
    >
      <Outlet />
    </AppShell>
  )
}