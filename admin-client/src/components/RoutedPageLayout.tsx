import React from 'react';
import { AppShell, Header, useMantineTheme } from '@mantine/core';
import { ApiHealth } from './ApiHealth';
import { SidebarNav } from './SidebarNav';
import { Outlet } from 'react-router-dom';

export function RoutedPageLayout() {
  const theme = useMantineTheme()
  return (
    <AppShell
      header={
        <Header height={60} sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing['xs']
        }}>
          <ApiHealth />
        </Header>
      }
      navbar={<SidebarNav />}
    >
      <Outlet />
    </AppShell>
  )
}