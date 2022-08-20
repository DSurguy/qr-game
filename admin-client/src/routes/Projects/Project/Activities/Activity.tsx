import { Box, Button, Card, Checkbox, Grid, Loader, Text, Textarea, TextInput, useMantineTheme } from '@mantine/core';
import { SavedActivity } from '@qrTypes';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Copy } from 'tabler-icons-react';
import { Field, FieldAttributes, Form, Formik, FormikHelpers } from 'formik';
import { activityToQrAsUrl } from '../../../../conversions/activityToQr';
import FormikNumberInput from '../../../../components/inputs/FormikNumberInput';
import { useServerResource } from '../../../../hooks/useServerResource';
import { replacePort } from '../../../../conversions/domain';
import copyToClipboardWithNotify from '../../../../utilities/copyToClipboardWithNotify';

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
  } = useServerResource<SavedActivity, SavedActivity>({
    load: `projects/${projectUuid}/activities/${activityUuid}`,
    update: `projects/${projectUuid}/activities/${activityUuid}`,
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
        if( activity ) {
          const code = await activityToQrAsUrl(activity, window.location.origin);
          setQrCode(code);
          setQrCodeError(null);
        }
      } catch (e) {
        setQrCodeError(e);
      }
    })();
  }, [activity])

  const handleSubmit = (values: SavedActivity, helpers: FormikHelpers<SavedActivity>) => {
    if( isSaving ) return;
    update(values, () => {
      helpers.setSubmitting(false)
    });
  }

  const portalLink = `${replacePort(window.location.origin)}/portal?projectUuid=${projectUuid}&type=activity&uuid=${activityUuid}`;

  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading activity"}</Text>
  if( !activity ) return null;
  return <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
      <Button
        compact
        variant="subtle"
        component={Link}
        to=".."
        leftIcon={<ChevronLeft size={16} />}
      >Back</Button>
      <Button compact variant="subtle" leftIcon={<Copy />} onClick={() => copyToClipboardWithNotify(portalLink)}>Copy Portal Link</Button>
    </Box>
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
              <Card shadow="sm" radius="md" sx={{ margin: '1rem' }} withBorder>
                <Card.Section sx={{ borderBottom: `1px solid ${theme.colors.gray[3]}`, marginBottom: '1rem'}}>
                  <Text weight="bold" sx={{ margin: '0.25rem 1rem'}}>Duel Settings</Text>
                </Card.Section>
                <Box>
                  <Field
                    name="isDuel"
                  >
                    {({ field }: FieldAttributes<any>) => (
                      <Checkbox
                        {...field}
                        checked={field.value}
                        label="Is Duel?"
                        sx={{ marginTop: '0.5rem' }}
                      />
                    )}
                  </Field>
                </Box>
              </Card>
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