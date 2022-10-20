import React from 'react';
import { Burger, Button, Header, Text, useMantineTheme } from '@mantine/core';
import { Camera } from 'tabler-icons-react'
import { matchPath, useLocation } from 'react-router-dom';

type Props = {
  openCaptureQrModal: () => void;
  openNavbar: () => void;
  closeNavbar: () => void;
  navbarOpen: boolean;
}

const getTitle = () => {
  const location = useLocation();
  if( matchPath({ path: '/game/inventory', end: false}, location.pathname) ) return 'Inventory';
  if( matchPath({ path: '/game/store', end: false}, location.pathname) ) return 'Store';
  if( matchPath({ path: '/game/me', end: false}, location.pathname) ) return 'Profile';
  if( matchPath({ path: '/game/player', end: false}, location.pathname) ) return 'Player';
  if( matchPath({ path: '/game/duels', end: false}, location.pathname) ) return 'Duels';
  if( matchPath({ path: '/game/activity', end: false}, location.pathname) ) return 'Activity';
}

export default function AuthHeader({ openCaptureQrModal, openNavbar, closeNavbar, navbarOpen }: Props) {
  const theme = useMantineTheme();
  
  return (
    <Header height={60} sx={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: theme.spacing['xs'],
      backgroundColor: theme.colors.dark[8]
    }}>
      <Burger opened={navbarOpen} onClick={() => navbarOpen ? closeNavbar() : openNavbar() } />
      <Text component="h1" sx={{ fontSize: '1.5rem', margin: 0, marginLeft: '10px', padding: 0 }}>
        {getTitle()}
      </Text>
      <Button sx={{ marginLeft: 'auto' }} onClick={openCaptureQrModal}>
        <Camera size={28} />
      </Button>
    </Header>
  );
}