import React, { useEffect } from 'react';
import { Field, FieldAttributes, Form, Formik, FormikHelpers } from 'formik';
import { Box, Button, Checkbox, Loader, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { ProjectSettingsType } from '@qr-game/types';
import { AutoSave } from '../../../components/forms/AutoSave';
import { useServerResource } from '../../../hooks/useServerResource';
import FormikNumberInput from '../../../components/inputs/FormikNumberInput';

export function Settings() {
  const { projectUuid } = useParams();
  const {
    data: settings,
    isSaving,
    isLoading,
    loadError,
    saveError,
    load: loadSettings,
    update: saveSettings
  } = useServerResource<ProjectSettingsType, ProjectSettingsType>({
    update: `projects/${projectUuid}/settings`,
    load: `projects/${projectUuid}/settings`
  })

  useEffect(() => {
    loadSettings(loadWasSuccessful => {
      console.log(loadWasSuccessful, settings)
    });
  }, [])

  const handleSubmit = (values: ProjectSettingsType, helpers: FormikHelpers<ProjectSettingsType>) => {
    if( isSaving ) return;
    saveSettings(values, () => helpers.setSubmitting(false));
  }

  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError.message}</Text>
  if( !settings ) return null;

  const normalizedSettings = {
    duels: {
      allow: true,
      allowRematch: false
    },
    initialPlayerBalance: 0,
    ...settings,
  }

  return (
    <Formik
      initialValues={normalizedSettings}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ dirty }) => (
        <Form>
          {saveError && <Text color="red">{saveError.message}</Text>}
          <Text component="h3" sx={{ fontSize: '1.5rem', margin: 0, marginTop: '1rem' }}>Duels</Text>
          <Field
            name="duels.allow"
          >
            {({ field }: FieldAttributes<any>) => (
              <Checkbox
                {...field}
                checked={field.value}
                label="Allow Duels"
                sx={{ marginTop: '0.5rem' }}
              />
            )}
          </Field>
          <Field
            name="duels.allowRematch"
          >
            {({ field, form }: FieldAttributes<any>) => (
              <Checkbox
                {...field}
                checked={field.value}
                label="Allow Duel Rematch"
                sx={{ marginTop: '0.5rem' }}
                disabled={(form.values?.duels?.allow !== true)}
              />
            )}
          </Field>
          <Field
            name="initialPlayerBalance"
            component={FormikNumberInput}
            mantineProps={{
              sx: { width: '8rem', marginTop: '0.5rem' },
              label: "Initial Player Balance"
            }}
          />
          <Button type="submit" disabled={!dirty} sx={{ marginTop: '1rem'}}>Save Settings</Button>
        </Form>
      )}
    </Formik>
  )
}