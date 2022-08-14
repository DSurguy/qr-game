import React, { useEffect, useState } from 'react';
import { resolvePath, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { showNotification, updateNotification } from '@mantine/notifications';
import { ADMIN_API_BASE, STORAGE_KEY_SESSION_ID } from '../constants';
import { useLocalStoredState } from './useLocalStoredState';
import { AlertTriangle, Check } from 'tabler-icons-react';

enum EntityType {
  player = 'player'
}

type Props = {
  onSuccess?: () => void;
  useNotifications?: boolean
}

export function usePortalHandler({ onSuccess, useNotifications = true }: Props = {}) {
  const [, setSessionId] = useLocalStoredState<string>(STORAGE_KEY_SESSION_ID)
  const navigate = useNavigate();
  const [isHandling, setIsHandling] = useState(false);
  const [error, setError] = useState("");

  /**
   * 
   * @param path A string that contains a URLSearchParams string, like 'some/path/?a=b&c=d' etc. It can be a full path, or just the searchParams
   */
  const handlePortalRoute = (path: string) => {
    setIsHandling(true);
    if( useNotifications ) showNotification({
      id: 'qr-loader',
      title: "Processing QR Code",
      message: 'Hang tight...',
      loading: true
    });
    ( async () => {
      const resolvedPath = resolvePath(path)
      const searchParams = new URLSearchParams(resolvedPath.search);
      const type = searchParams.get('type');
      const uuid = searchParams.get('uuid');
      const projectUuid = searchParams.get('projectUuid');
      if( !type || !uuid || !projectUuid ) {
        setError("Malformed Portal URL, please try again")
        return;
      }

      try {
        switch(type) {
          case EntityType.player: {
            const response = await fetch(`${ADMIN_API_BASE}/portal/player?projectUuid=${projectUuid}&playerUuid=${uuid}`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json'
              },
            })
            const { target, setAuth } = await response.json();
            if( setAuth ) setSessionId(setAuth);
            navigate(target, {
              replace: true
            });
            break;
          }
          default: setError("Unknown entity type, please try again");
        }
        if( useNotifications ) updateNotification({
          id: 'qr-loader',
          title: 'Processing QR Code',
          icon: <Check />,
          message: 'Success!',
          color: 'green',
          autoClose: 2000
        })
      } catch (e) {
        console.error(e);
        if( useNotifications ) updateNotification({
          id: 'qr-loader',
          title: 'Processing QR Code',
          icon: <AlertTriangle />,
          message: 'Error processing QR code. Find an admin!',
          color: 'red',
          autoClose: 2000
        })
        setError(`Unable to process portal link through server. ${e.message}`);
      } finally {
        setIsHandling(false);
      }
    })();
  }

  return {
    handlePortalRoute,
    isHandling,
    error
   } as const
}