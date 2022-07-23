import { Box, Button, Loader, Text } from '@mantine/core';
import { SavedActivityType } from '@qr-game/types';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'tabler-icons-react';
import { ADMIN_API_BASE } from '../../../../constants';
import activityToQr from '../../../../conversions/activityToQr';
import { ApiActionCallback } from '../../../../types';

const useActivity = (projectUuid: string, activityUuid: string) => {
  const [activity, setActivity] = useState<null | SavedActivityType>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);

  /**
   * Load project activity from the server
   * @param callback A function that can perform cleanup actions, such as telling Formik loading is complete. It will receive one argument, indicating if the API action was successful or not
   */
  const load = (callback?: ApiActionCallback) => {
    setIsLoading(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/projects/${projectUuid}/activities/${activityUuid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if( result.status <= 299 && result.status >= 200 ) {
          setActivity(await result.json());
          setError(null);
          if( callback ) callback(true);
        }
        else {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
      } catch (e) {
        setError(e);
        if( callback ) callback(false)
      } finally {
        setIsLoading(false);
      }
    })()
  }

  /**
   * Save project activity to the server
   * @param values 
   * @param callback A function that can perform cleanup actions, such as telling Formik submission is complete. It will receive one argument, indicating if the API action was successful or not
   */
  const save = (values: SavedActivityType, callback?: ApiActionCallback) => {
    setIsSaving(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/projects/${projectUuid}/activities/${activityUuid}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        })
        if( result.status > 299 || result.status < 200 ) {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
        setActivity(values);
        setError(null);
        callback(true);
      } catch (e) {
        setError(e);
        callback(false)
      } finally {
        setIsSaving(false);
      }
    })()
  }

  return {
    activity,
    isSaving,
    isLoading,
    error,
    load,
    save
  } as const
}

export default function Activity() {
  const { projectUuid, activityUuid } = useParams();
  const {activity, isSaving, isLoading, error, load, save} = useActivity(projectUuid, activityUuid);
  const [qrCode, setQrCode] = useState<null | string>(null)
  const [qrCodeError, setQrCodeError] = useState<null | Error>(null);

  useEffect(() => {
    load();
  }, [])

  useEffect(() => {
    ( async () => {
      try {
        if( activity ) {
          const code = await activityToQr(activity);
          setQrCode(code);
          setQrCodeError(null);
        }
      } catch (e) {
        setQrCodeError(e);
      }
    })();
  }, [activity])

  if( isLoading ) return <Loader />
  if( error ) return <Text color="red">{error ? error.message : "Error loading project"}</Text>
  if( !activity ) return null;
  return <Box>
    <Button
      compact
      variant="subtle"
      component={Link}
      to=".."
      leftIcon={<ChevronLeft size={16} />}
    >Back</Button>
    <Box>{activity.uuid} {activity.wordId}</Box>
    <Box>
      { qrCodeError && qrCodeError.message }
      { qrCode && <img src={qrCode} /> }
    </Box>
  </Box>
}