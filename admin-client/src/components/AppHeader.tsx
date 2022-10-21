import React from 'react';
import { Burger, Header, useMantineTheme } from '@mantine/core';
import { ApiHealth } from './ApiHealth';

type Props = {
  openNavbar: () => void;
  closeNavbar: () => void;
  navbarOpen: boolean;
}

export default function AppHeader({ openNavbar, closeNavbar, navbarOpen }: Props) {
  const theme = useMantineTheme();
  
  return (
    <Header height={60} sx={{
      display: 'flex',
      alignItems: 'flex-start',
      padding: theme.spacing['xs'],
    }}>
      <Burger opened={navbarOpen} onClick={() => navbarOpen ? closeNavbar() : openNavbar() } sx={{ marginRight: '1rem' }}/>
      <ApiHealth />
    </Header>
  );
}