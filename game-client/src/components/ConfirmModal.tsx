import { Box, Button, Modal } from '@mantine/core';
import React from 'react';

type Props = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children: JSX.Element | JSX.Element[] | null;
  title: string;
}

export default function ConfirmModal ({ opened, onClose, onConfirm, children, title }: Props) {
  return <Modal opened={opened} onClose={onClose} title={title}>
    {children}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
      <Button color="green" onClick={onConfirm}>Confirm</Button>
    </Box>
  </Modal>
}