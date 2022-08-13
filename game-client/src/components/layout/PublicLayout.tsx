import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, Loader } from '@mantine/core';
import { hideNotification, showNotification } from '@mantine/notifications';
import PublicHeader from './PublicHeader';
import CaptureQrModal from '../CaptureQrModal/CaptureQrModal';
import { usePortalHandler } from '../../hooks/portalRouteHandler';
import { Check } from 'tabler-icons-react'

export default function PublicLayout() {
  const [captureQrModalOpen, setCaptureQrModalOpen] = useState(false);
  const { handlePortalRoute, error: qrParseError } = usePortalHandler({
    onSuccess: () => {
      hideNotification('qr-loader');
      //TODO: Have the server send a message
      showNotification({
        title: 'Success!',
        message: 'QR code successfully processed',
        icon: <Check />,
        color: 'green'
      })
    }
  });

  useEffect(() => {
    if( qrParseError ) {
      showNotification({
        title: "QR Code Error",
        message: qrParseError,
        color: 'red'
      })
      hideNotification('qr-loader');
    }
  }, [qrParseError])

  const onQrPayload = (payload: string) => {
    showNotification({
      id: 'qr-loader',
      title: "Processing QR Code",
      message: <Loader size={24} />
    })
    handlePortalRoute(payload);
    setCaptureQrModalOpen(false);
  }

  return (
    <AppShell
      header={<PublicHeader openCaptureQrModal={ () => setCaptureQrModalOpen(true)}/>}
    >
      <CaptureQrModal
        opened={captureQrModalOpen}
        onClose={() => setCaptureQrModalOpen(false)}
        onQrPayload={onQrPayload}
      />
      <Outlet />
    </AppShell>
  )
}