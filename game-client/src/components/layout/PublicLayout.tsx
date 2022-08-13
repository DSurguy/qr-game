import React, { useState } from 'react';
import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import CaptureQrModal from '../CaptureQrModal/CaptureQrModal';

export default function PublicLayout() {
  const [captureQrModalOpen, setCaptureQrModalOpen] = useState(false);
  return (
    <AppShell
      header={<PublicHeader openCaptureQrModal={ () => setCaptureQrModalOpen(true)}/>}
    >
      <CaptureQrModal opened={captureQrModalOpen} onClose={() => setCaptureQrModalOpen(false)} />
      <Outlet />
    </AppShell>
  )
}