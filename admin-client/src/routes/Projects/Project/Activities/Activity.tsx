import { Box, Button, Grid, Loader, Text, Textarea, TextInput, useMantineTheme } from '@mantine/core';
import { SavedActivityType } from '@qr-game/types';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'tabler-icons-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import activityToQr from '../../../../conversions/activityToQr';
import FormikNumberInput from '../../../../components/inputs/FormikNumberInput';
import { useServerResource } from '../../../../hooks/useServerResource';

export default function Activity() {
  const { projectUuid, activityUuid } = useParams();
  const {
    data: activity,
    isSaving,
    isLoading,
    saveError,
    loadError,
    update,
    load
  } = useServerResource<SavedActivityType, SavedActivityType>({
    load: `projects/${projectUuid}/activities/${activityUuid}`,
    update: `projects/${projectUuid}/activities/${activityUuid}`,
  })
  console.log(activity);
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
    update(values, () => {
      helpers.setSubmitting(false)
    });
  }

  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading activity"}</Text>
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
        <Formik initialValues={activity} onSubmit={handleSubmit} enableReinitialize>
          {({ dirty }) => (
            <Form>
              {saveError && <Text color="red">{saveError.message}</Text>}
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