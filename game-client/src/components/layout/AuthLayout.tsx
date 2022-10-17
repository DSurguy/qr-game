import React, { useContext, useEffect, useState } from 'react';
import { AppShell, Box, Header, Loader, Text, useMantineTheme } from '@mantine/core';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useLocalStoredState } from '../../hooks/useLocalStoredState';
import { STORAGE_KEY_SESSION_ID } from '../../constants';
import { usePortalHandler } from '../../hooks/portalRouteHandler';
import AuthHeader from './AuthHeader';
import CaptureQrModal from '../CaptureQrModal/CaptureQrModal';
import AuthNavbar from './AuthNavbar';
import { useServerResource } from '../../hooks/useServerResource';
import { Diamond } from 'tabler-icons-react';
import { PlayerBalanceContext } from '../../context/playerBalance';

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
  const location = useLocation();

  const onQrPayload = (payload: string) => {
    handlePortalRoute(payload);
    setCaptureQrModalOpen(false);
  }

  const {
    data: balance,
    isLoading: isLoadingBalance,
    loadError: loadBalanceError,
    load: loadBalance,
  } = useServerResource<null, number>({
    load: `game/me/balance`
  })

  useEffect(() => {
    loadBalance();
  }, [location])

  const balanceContent = () => {
    if( isLoadingBalance ) return <Loader />
    if( loadBalanceError ) return <Text color={theme.colors['errorColor'][4]}>Error loading item {loadBalanceError?.message}</Text>
    if( balance === undefined || balance === null ) return null;

    return <Box sx={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.colors.dark[4],
      padding: '0.5rem 1rem',
      margin: '-1rem',
      marginBottom: '1rem'
    }}>
      <Diamond /><Text sx={{ fontSize: '1.25rem', marginLeft: '0.25rem' }}>{balance}</Text>
    </Box>
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
      { captureQrModalOpen && <CaptureQrModal
        opened={captureQrModalOpen}
        onClose={() => setCaptureQrModalOpen(false)}
        onQrPayload={onQrPayload}
      />}
      {balanceContent()}
      <PlayerBalanceContext.Provider value={{ balance, updateBalance: () => loadBalance()}}>
        <Outlet />
      </PlayerBalanceContext.Provider>
    </AppShell>
  )
}