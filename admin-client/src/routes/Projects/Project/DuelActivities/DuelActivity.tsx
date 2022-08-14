import { Box, Button, Checkbox, Grid, Loader, Text, Textarea, TextInput, useMantineTheme } from '@mantine/core';
import { SavedActivityType } from '@qr-game/types';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'tabler-icons-react';
import { Field, FieldAttributes, Form, Formik, FormikHelpers } from 'formik';
import FormikNumberInput from '../../../../components/inputs/FormikNumberInput';
import { useServerResource } from '../../../../hooks/useServerResource';
import { duelActivityToQrAsUrl } from '../../../../conversions/duelActivityToQr';

export default function DuelActivity() {
  const { projectUuid, duelActivityUuid } = useParams();
  const {
    data: duelActivity,
    isSaving,
    isLoading,
    saveError,
    loadError,
    update,
    load
  } = useServerResource<SavedActivityType, SavedActivityType>({
    load: `projects/${projectUuid}/duelActivities/${duelActivityUuid}`,
    update: `projects/${projectUuid}/duelActivities/${duelActivityUuid}`,
  })
  const [qrCode, setQrCode] = useState<null | string>(null)
  const [qrCodeError, setQrCodeError] = useState<null | Error>(null);
  const theme = useMantineTheme();

  useEffect(() => {
    load();
  }, [])

  useEffect(() => {
    ( async () => {
      try {
        if( duelActivity ) {
          const code = await duelActivityToQrAsUrl(duelActivity, window.location.origin);
          setQrCode(code);
          setQrCodeError(null);
        }
      } catch (e) {
        setQrCodeError(e);
      }
    })();
  }, [duelActivity])

  const handleSubmit = (values: SavedActivityType, helpers: FormikHelpers<SavedActivityType>) => {
    if( isSaving ) return;
    update(values, () => {
      helpers.setSubmitting(false)
    });
  }

  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading duelActivity"}</Text>
  if( !duelActivity ) return null;
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
        <Formik initialValues={duelActivity} onSubmit={handleSubmit} enableReinitialize>
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
              <Field
                name="isRepeatable"
              >
                {({ field }: FieldAttributes<any>) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                    label="Is Repeatable?"
                    sx={{ marginTop: '0.5rem' }}
                  />
                )}
              </Field>
              <Field
                name="repeatValue"
              >
                {({ field, form }: FieldAttributes<any>) => (
                  <FormikNumberInput
                    field={field}
                    form={form}
                    mantineProps={{
                      disabled: form.values?.isRepeatable !== true,
                      sx: { width: '8rem' },
                      label: "Repeat Value"
                    }}
                  />
                )}
              </Field>
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