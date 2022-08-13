import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import PublicHeader from './PublicHeader';
import CaptureQrModal from '../CaptureQrModal/CaptureQrModal';
import { usePortalHandler } from '../../hooks/portalRouteHandler';

export default function PublicLayout() {
  const [captureQrModalOpen, setCaptureQrModalOpen] = useState(false);
  const { handlePortalRoute } = usePortalHandler();

  const onQrPayload = (payload: string) => {
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