import React from 'react';
import { Button, Header, Text, useMantineTheme } from '@mantine/core';
import { Camera } from 'tabler-icons-react'

export default function AuthHeader() {
  const theme = useMantineTheme();
  
  return (
    <Header height={60} sx={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: theme.spacing['xs']
    }}>
      <Text component="h1" sx={{ fontSize: '1.5rem', margin: 0, padding: 0 }}>QR Game</Text>
      <Button sx={{ marginLeft: 'auto' }}>
        <Camera size={28} />
      </Button>
    </Header>
  );
}