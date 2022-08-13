import React from 'react';
import { Burger, Button, Header, Text, useMantineTheme } from '@mantine/core';
import { Camera } from 'tabler-icons-react'

type Props = {
  openCaptureQrModal: () => void;
  openNavbar: () => void;
  closeNavbar: () => void;
  navbarOpen: boolean;
}

export default function AuthHeader({ openCaptureQrModal, openNavbar, closeNavbar, navbarOpen }: Props) {
  const theme = useMantineTheme();
  
  return (
    <Header height={60} sx={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: theme.spacing['xs']
    }}>
      <Burger opened={navbarOpen} onClick={() => navbarOpen ? closeNavbar() : openNavbar() } />
      <Text component="h1" sx={{ fontSize: '1.5rem', margin: 0, padding: 0 }}>QR Game</Text>
      <Button sx={{ marginLeft: 'auto' }} onClick={openCaptureQrModal}>
        <Camera size={28} />
      </Button>
    </Header>
  );
}