import { Box, Button, Modal } from '@mantine/core';
import React from 'react';

type Props = {
  opened: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  children: JSX.Element | JSX.Element[] | null;
  title: string;
}

export default function AcceptRejectModal ({ opened, onClose, onAccept, onReject, children, title }: Props) {
  return <Modal opened={opened} onClose={onClose} title={title}>
    {children}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
      <Button onClick={onAccept}>Accept</Button>
      <Button color="errorColor" onClick={onReject}>Reject</Button>
    </Box>
  </Modal>
}