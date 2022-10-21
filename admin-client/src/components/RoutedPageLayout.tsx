import React, { useState } from 'react';
import { AppShell, useMantineTheme } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppNavbar from './AppNavbar';

export function RoutedPageLayout() {
  const theme = useMantineTheme()
  const [navbarOpen, setNavbarOpen] = useState(false);
  return (
    <AppShell
      header={
        <AppHeader
          openNavbar={() => setNavbarOpen(true)}
          closeNavbar={() => setNavbarOpen(false)}
          navbarOpen={navbarOpen}
        />
      }
    >
      { <AppNavbar opened={navbarOpen} onClose={ () => setNavbarOpen(false) } /> }
      <Outlet />
    </AppShell>
  )
}