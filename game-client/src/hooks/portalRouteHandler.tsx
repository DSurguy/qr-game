import React, { useEffect, useState } from 'react';
import { resolvePath, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ADMIN_API_BASE, STORAGE_KEY_SESSION_ID } from '../constants';
import { useLocalStoredState } from './useLocalStoredState';

enum EntityType {
  player = 'player'
}

type Props = {
  onSuccess?: () => void;
}

export function usePortalHandler({ onSuccess }: Props = {}) {
  const [, setSessionId] = useLocalStoredState<string>(STORAGE_KEY_SESSION_ID)
  const navigate = useNavigate();
  const [isHandling, setIsHandling] = useState(false);
  const [error, setError] = useState("");

  const handlePortalRoute = (path: string) => {
    setIsHandling(true);
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
            setSessionId(setAuth);
            navigate(target, {
              replace: true
            });
            break;
          }
          default: setError("Unknown entity type, please try again");
        }
        if( onSuccess ) onSuccess();
      } catch (e) {
        console.error(e);
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