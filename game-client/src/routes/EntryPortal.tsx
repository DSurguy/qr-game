import React, { useEffect, useState } from 'react';
import { Box, Text, Textarea } from '@mantine/core';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ADMIN_API_BASE, STORAGE_KEY_SESSION_ID } from '../constants';
import { useLocalStoredState } from '../hooks/useLocalStoredState';

enum EntityType {
  player = 'player'
}

export default function EntryPortalRoute() {
  const [, setSessionId] = useLocalStoredState<string>(STORAGE_KEY_SESSION_ID)
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    ( async () => {
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
            navigate(target);
            break;
          }
          default: setError("Unknown entity type, please try again");
        }
      } catch (e) {
        console.error(e);
        setError(`Unable to process portal link through server. ${e.message}`);
      }
    })();

    return () => {};
  }, [])

  return (
    <Box>
      { error && <Text color="red">{error}</Text>}
      <Text sx={{ fontFamily: 'monospace'}}><pre>{JSON.stringify(location, null, 2)}</pre></Text>
      <Text sx={{ fontFamily: 'monospace'}}><pre>{JSON.stringify({
        projectUuid: searchParams.get('projectUuid'),
        uuid: searchParams.get('uuid'),
        type: searchParams.get('type')
      }, null, 2)}</pre></Text>
    </Box>
  );
}