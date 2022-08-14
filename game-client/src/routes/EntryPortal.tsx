import React, { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { LoadingOverlay } from '@mantine/core';
import { usePortalHandler } from '../hooks/portalRouteHandler';

export default function EntryPortalRoute() {
  const location = useLocation();
  const { handlePortalRoute } = usePortalHandler();

  useEffect(() => {
    if( location ) {
      handlePortalRoute(location.search)
    }
  }, [location])

  return (
    <LoadingOverlay visible />
  );
}