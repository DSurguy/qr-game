import { Box, Button, Grid, Loader, Text, Textarea, TextInput, useMantineTheme } from '@mantine/core';
import { SavedActivityType } from '@qr-game/types';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'tabler-icons-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { ADMIN_API_BASE } from '../../../../constants';
import activityToQr from '../../../../conversions/activityToQr';
import { ApiActionCallback } from '../../../../types';
import FormikNumberInput from '../../../../components/inputs/FormikNumberInput';

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
          method: 'PUT',
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
  const theme = useMantineTheme();

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

  const handleSubmit = (values: SavedActivityType, helpers: FormikHelpers<SavedActivityType>) => {
    if( isSaving ) return;
    save(values, (saveSuccessful) => {
      helpers.setSubmitting(false)
      load()
    });
  }

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
    <Grid sx={{ marginTop: '0.5rem'}}>
      <Grid.Col xs={12}>
      <Formik initialValues={activity} onSubmit={handleSubmit}>
        {({ dirty }) => (
          <Form>
            {error && <Text color="red">{error.message}</Text>}
            <Field name="name" as={TextInput} label="Activity Name" />
            <Field name="description" as={Textarea} label="Description" sx={{ marginTop: theme.spacing['xs'] }} />
            <Field
                name="value"
                component={FormikNumberInput}
                mantineProps={{
                  sx: { width: '8rem' },
                  label: "Value"
                }}
              />
            {dirty && <Button type="submit" disabled={isSaving} sx={{
              marginTop: theme.spacing['xs']
            }}>Save Activity</Button>}
          </Form>
        )}
      </Formik>
      </Grid.Col>
    </Grid>
    <Box>
      { qrCodeError && qrCodeError.message }
      { qrCode && <img src={qrCode} /> }
    </Box>
  </Box>
}