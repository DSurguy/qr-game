import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LoadingOverlay } from '@mantine/core';
import { usePortalHandler } from '../hooks/portalRouteHandler';

export default function EntryPortalRoute() {
  const location = useLocation();
  const { handlePortalRoute, error: qrParseError } = usePortalHandler();

  useEffect(() => {
    if( location ) {
      handlePortalRoute(location.search)
    }
  }, [location])

  return (
    <LoadingOverlay visible />
  );
}