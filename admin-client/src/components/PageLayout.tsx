import React from 'react';
import { AppShell, Header, useMantineTheme } from '@mantine/core';
import { ApiHealth } from '../components/ApiHealth';
import { SidebarNav } from '../components/SidebarNav';

type Props = {
  children: JSX.Element[] | JSX.Element | string | string[];
}

export function PageLayout({ children }: Props) {
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
      {children}
    </AppShell>
  )
}