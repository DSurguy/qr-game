import React from 'react';
import { Box, Button, Modal } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import QrCapture from '../QrCapture';
import { useMediaQuery, useViewportSize } from '@mantine/hooks';

type Props = {
  opened: boolean;
  onClose: () => void;
}

export default function CaptureQrModal({ opened, onClose }: Props) {
  const isTooSmall = useMediaQuery('(max-width: 640px), (max-height: 640px)')

  const { height: viewHeight, width: viewWidth } = useViewportSize();
  const captureHeight = viewHeight < 500 ? viewHeight : 500;
  const captureWidth = viewWidth < 500 ? viewWidth : 500;

  const onQrPayload = (payload: string) => {
    showNotification({
      title: "Payload Received",
      message: payload
    })
    onClose()
  }

  const modalProps = {
    centered: isTooSmall ? undefined : true,
    fullScreen: isTooSmall ? true : false,
    styles: {
      body: {
        height: '100%'
      }
    },
    padding: isTooSmall ? 0 : undefined
  }

  const modalPadding = 20;

  return (
    <Modal opened={opened} onClose={onClose} {...modalProps} withCloseButton={false} size={captureWidth + modalPadding*2}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <QrCapture onQrPayload={onQrPayload} captureHeight={captureHeight} captureWidth={captureWidth} captureOnce />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0.5rem', marginTop: 'auto' }}>
          <Button onClick={onClose}>Cancel</Button>
        </Box>
      </Box>
    </Modal>
  )
}

