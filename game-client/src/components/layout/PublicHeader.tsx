import React from 'react';
import { Button, Header, Text, useMantineTheme } from '@mantine/core';
import { Camera } from 'tabler-icons-react'

type Props = {
  openCaptureQrModal: () => void;
}

export default function PublicHeader({ openCaptureQrModal }: Props) {
  const theme = useMantineTheme();

  return (
    <Header height={60} sx={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: theme.spacing['xs']
    }}>
      <Text component="h1" sx={{ fontSize: '1.5rem', margin: 0, padding: 0 }}>QR Game</Text>
      <Button sx={{ marginLeft: 'auto' }} onClick={openCaptureQrModal}>
        <Camera size={28} />
      </Button>
    </Header>
  );
}