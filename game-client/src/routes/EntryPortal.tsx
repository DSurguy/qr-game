import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Loader, LoadingOverlay, Overlay, Text, Textarea } from '@mantine/core';
import { hideNotification, showNotification, updateNotification } from '@mantine/notifications';
import { Check, AlertTriangle } from 'tabler-icons-react';
import { usePortalHandler } from '../hooks/portalRouteHandler';

export default function EntryPortalRoute() {
  const location = useLocation();
  const { handlePortalRoute, error: qrParseError } = usePortalHandler({
    onSuccess: () => {
      //TODO: Have the server send a message
      updateNotification({
        id: 'qr-loader',
        title: 'Processing QR Code',
        icon: <Check />,
        message: 'Success!',
        color: 'green',
        autoClose: 2000
      })
    }
  });

  useEffect(() => {
    if( location ) {
      showNotification({
        id: 'qr-loader',
        title: "Processing QR Code",
        message: 'Hang tight...',
        loading: true
      })
      handlePortalRoute(location.search)
    }
  }, [location])

  useEffect(() => {
    if( qrParseError ) {
      updateNotification({
        id: 'qr-loader',
        title: 'Processing QR Code',
        icon: <AlertTriangle />,
        message: 'Error processing QR code. Find an admin!',
        color: 'red',
        autoClose: 2000
      })
    }
  }, [qrParseError])

  return (
    <LoadingOverlay visible />
  );
}