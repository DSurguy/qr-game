import React, { useEffect, useState } from 'react';
import { AppShell, Header, Loader, useMantineTheme } from '@mantine/core';
import { Outlet, useNavigate } from 'react-router-dom';
import { useLocalStoredState } from '../../hooks/useLocalStoredState';
import { STORAGE_KEY_SESSION_ID } from '../../constants';
import { usePortalHandler } from '../../hooks/portalRouteHandler';
import AuthHeader from './AuthHeader';
import CaptureQrModal from '../CaptureQrModal/CaptureQrModal';
import AuthNavbar from './AuthNavbar';

export default function AuthLayout() {  
  const navigate = useNavigate();
  const [sessionId] = useLocalStoredState<string>(STORAGE_KEY_SESSION_ID);

  useEffect(() => {
    if( !sessionId ) navigate('/login', {
      replace: true
    })
  }, [sessionId])

  if( !sessionId ) return <Loader />
  
  const [captureQrModalOpen, setCaptureQrModalOpen] = useState(false);
  const { handlePortalRoute } = usePortalHandler();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const theme = useMantineTheme();

  const onQrPayload = (payload: string) => {
    handlePortalRoute(payload);
    setCaptureQrModalOpen(false);
  }

  return (
    <AppShell
      header={<AuthHeader
        openCaptureQrModal={ () => setCaptureQrModalOpen(true)}
        openNavbar={() => setNavbarOpen(true)}
        closeNavbar={() => setNavbarOpen(false)}
        navbarOpen={navbarOpen}
      />}
    >
      { <AuthNavbar opened={navbarOpen} onClose={ () => setNavbarOpen(false) } /> }
      <CaptureQrModal
        opened={captureQrModalOpen}
        onClose={() => setCaptureQrModalOpen(false)}
        onQrPayload={onQrPayload}
      />
      <Outlet />
    </AppShell>
  )
}